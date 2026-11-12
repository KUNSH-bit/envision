
import {type Request, type Response, Router} from 'express';

import {prisma} from '../prisma.js';

const router = Router();

const operatingSystemMap = {
  Windows: 'WINDOWS',
  Linux: 'LINUX',
  macOS: 'MACOS'
} as const;

type SupportedOperatingSystem = keyof typeof operatingSystemMap;

function normalize(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, ' ');
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
        !(operatingSystem in operatingSystemMap)) {
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
        typeof language === 'string' ? normalize(language) : '';

    const query = normalize(description);

    // Retrieve issues that apply to the selected OS,
    // including issues that apply to every OS.
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

    // Apply the optional language filter.
    const languageFilteredIssues = issues.filter(issue => {
      if (!selectedLanguage || !issue.language) {
        return true;
      }

      return normalize(issue.language) === selectedLanguage;
    });

    // Match the user's description against stored phrases.
    // This is deterministic matching, not AI.
    const results =
        languageFilteredIssues
            .map(issue => {
              const searchablePhrases = [
                issue.title, issue.description, ...issue.errorPatterns
              ].filter(Boolean);

              const matchedPhrase = searchablePhrases.find(phrase => {
                const normalizedPhrase = normalize(phrase);

                if (normalizedPhrase.length < 5) {
                  return false;
                }

                return (
                    query.includes(normalizedPhrase) ||
                    (normalizedPhrase.length >= 8 &&
                     normalizedPhrase.includes(query)));
              });

              if (!matchedPhrase) {
                return null;
              }

              return {
                ...issue,
                matchReason: `Matched stored issue phrase: "${matchedPhrase}"`
              };
            })
            .filter(issue => issue !== null)
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
