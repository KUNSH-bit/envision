
import {type Request, type Response, Router} from 'express';

import {prisma} from '../prisma.js';

const router = Router();

const operatingSystemMap = {
  Windows: 'WINDOWS',
  Linux: 'LINUX',
  macOS: 'MACOS'
} as const;

type SupportedOperatingSystem = keyof typeof operatingSystemMap;

const stopWords = new Set([
  'a',    'an',    'and', 'are',  'as',   'at',   'but', 'by',
  'can',  'could', 'do',  'does', 'for',  'from', 'how', 'i',
  'in',   'is',    'it',  'my',   'of',   'on',   'or',  'the',
  'this', 'to',    'was', 'were', 'what', 'when', 'why', 'with'
]);

const distinctiveTokens = new Set([
  'g++', 'gcc', 'clang', 'mingw', 'msys2', 'cmake', 'compiler', 'python',
  'node', 'npm', 'typescript', 'java', 'rust', 'postgres', 'postgresql',
  'prisma', 'vite', 'react'
]);

function normalize(value: string): string {
  return value.toLowerCase()
      .replace(/[^\p{L}\p{N}+#.]+/gu, ' ')
      .trim()
      .replace(/\s+/g, ' ');
}

function tokenize(value: string): string[] {
  return normalize(value).split(' ').filter(
      token => token.length > 0 && !stopWords.has(token));
}

function tokensMatch(first: string, second: string): boolean {
  if (first === second) {
    return true;
  }

  // Handles simple variations such as install / installed.
  return (
      first.length >= 5 && second.length >= 5 &&
      (first.startsWith(second) || second.startsWith(first)));
}

interface MatchResult {
  score: number;
  matchedPhrase: string;
  reason: string;
}

function scorePhrase(
    query: string, queryTokens: string[], phrase: string): MatchResult|null {
  const normalizedPhrase = normalize(phrase);

  if (!normalizedPhrase) {
    return null;
  }

  // Exact phrase match gets the highest priority.
  if (query.includes(normalizedPhrase)) {
    return {
      score: 100,
      matchedPhrase: phrase,
      reason: 'Exact error phrase match'
    };
  }

  if (normalizedPhrase.length >= 8 && normalizedPhrase.includes(query)) {
    return {
      score: 90,
      matchedPhrase: phrase,
      reason: 'The stored issue phrase contains your search'
    };
  }

  const phraseTokens = tokenize(normalizedPhrase);

  if (queryTokens.length === 0 || phraseTokens.length === 0) {
    return null;
  }

  const matchedQueryTokens = queryTokens.filter(
      queryToken => phraseTokens.some(
          phraseToken => tokensMatch(queryToken, phraseToken)));

  const matchedPhraseTokens = phraseTokens.filter(
      phraseToken =>
          queryTokens.some(queryToken => tokensMatch(queryToken, phraseToken)));

  const sharedCount = matchedQueryTokens.length;

  if (sharedCount === 0) {
    return null;
  }

  const queryCoverage = sharedCount / queryTokens.length;
  const phraseCoverage = matchedPhraseTokens.length / phraseTokens.length;

  let score = queryCoverage * 60 + phraseCoverage * 30;

  if (sharedCount >= 2) {
    score += 10;
  }

  // Allow one distinctive technical keyword to identify an issue.
  if (sharedCount === 1 && distinctiveTokens.has(matchedQueryTokens[0])) {
    score = Math.max(score, 45);
  }

  // Avoid weak matches based on unrelated common words.
  const isGoodMatch = (sharedCount >= 2 && queryCoverage >= 0.4) ||
      (sharedCount === 1 && distinctiveTokens.has(matchedQueryTokens[0]));

  if (!isGoodMatch) {
    return null;
  }

  return {
    score,
    matchedPhrase: phrase,
    reason: 'Matched related technical keywords'
  };
}

function getIssueMatch(description: string, issue: {
  title: string; description: string; errorPatterns: string[];
}): MatchResult|null {
  const query = normalize(description);
  const queryTokens = tokenize(query);

  const searchablePhrases =
      [issue.title, issue.description, ...issue.errorPatterns];

  const matches =
      searchablePhrases.map(phrase => scorePhrase(query, queryTokens, phrase))
          .filter((match): match is MatchResult => match !== null);

  if (matches.length === 0) {
    return null;
  }

  matches.sort((a, b) => b.score - a.score);

  return matches[0];
}

function normalizeLanguage(value: string): string {
  const language = normalize(value);

  const aliases: Record<string, string> = {
    cpp: 'c++',
    'c plus plus': 'c++',
    'c sharp': 'c#',
    js: 'javascript',
    ts: 'typescript'
  };

  return aliases[language] ?? language;
}

router.post('/search', async (req: Request, res: Response) => {
  try {
    const {description, operatingSystem, language} = req.body ?? {};

    if (typeof description !== 'string' || !description.trim()) {
      res.status(400).json(
          {message: 'Please provide a description of your issue.'});
      return;
    }

    if (description.length > 3000) {
      res.status(400).json(
          {message: 'Issue descriptions must be 3000 characters or fewer.'});
      return;
    }

    if (typeof operatingSystem !== 'string' ||
        !Object.prototype.hasOwnProperty.call(
            operatingSystemMap, operatingSystem)) {
      res.status(400).json(
          {message: 'Please provide a supported operating system.'});
      return;
    }

    if (language !== undefined && typeof language !== 'string') {
      res.status(400).json({message: 'The language or tool must be text.'});
      return;
    }

    const selectedOS =
        operatingSystemMap[operatingSystem as SupportedOperatingSystem];

    const selectedLanguage =
        typeof language === 'string' ? normalizeLanguage(language) : '';

    const issues = await prisma.issue.findMany({
      where: {OR: [{os: selectedOS}, {os: null}]},
      include: {
        solutions: {
          include: {
            steps: {orderBy: {order: 'asc'}},
            tutorials:
                {include: {steps: {orderBy: {order: 'asc'}}, sources: true}},
            sources: true
          }
        },
        tutorials: {include: {steps: {orderBy: {order: 'asc'}}, sources: true}}
      }
    });

    const languageFilteredIssues = issues.filter(issue => {
      if (!selectedLanguage || !issue.language) {
        return true;
      }

      return (normalizeLanguage(issue.language) === selectedLanguage);
    });

    const results =
        languageFilteredIssues
            .map(issue => {
              const match = getIssueMatch(description, issue);

              if (!match) {
                return null;
              }

              return {
                ...issue,
                matchReason: match.reason,
                matchedPhrase: match.matchedPhrase,
                matchScore: Math.round(match.score)
              };
            })
            .filter(
                (issue): issue is NonNullable<typeof issue> => issue !== null)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 10);

    res.json({
      query: description,
      resultCount: results.length,
      results,
      message: results.length > 0 ?
          'Matching issues found.' :
          'No matching issues were found in the current knowledge base.'
    });
  } catch (error) {
    console.error('Issue search failed:', error);

    res.status(500).json(
        {message: 'Something went wrong while searching for your issue.'});
  }
});

export default router;
