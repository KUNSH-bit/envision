
import {type Request, type Response, Router} from 'express';

import {prisma} from '../prisma.js';

const router = Router();

const operatingSystemMap = {
  Windows: 'WINDOWS',
  Linux: 'LINUX',
  macOS: 'MACOS'
} as const;

type SupportedOperatingSystem = keyof typeof operatingSystemMap;

const validStatuses = ['DRAFT', 'VERIFIED', 'OUTDATED'] as const;

type ContentStatus = typeof validStatuses[number];

function normalizeLanguage(value: string): string {
  const language = value.toLowerCase().trim();

  const aliases: Record<string, string> = {
    cpp: 'c++',
    'c plus plus': 'c++',
    'c sharp': 'c#',
    js: 'javascript',
    ts: 'typescript'
  };

  return aliases[language] ?? language;
}

/*
 * GET /api/tutorials
 *
 * Optional query parameters:
 * os=Windows
 * language=C++
 * status=VERIFIED
 *
 * Returns tutorial summaries, not their full steps.
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const {os, language, status} = req.query;

    if (os !== undefined && typeof os !== 'string') {
      res.status(400).json({message: 'Operating system must be text.'});
      return;
    }

    if (typeof os === 'string' &&
        !Object.prototype.hasOwnProperty.call(operatingSystemMap, os)) {
      res.status(400).json({message: 'Unsupported operating system.'});
      return;
    }

    if (language !== undefined && typeof language !== 'string') {
      res.status(400).json({message: 'Language must be text.'});
      return;
    }

    if (status !== undefined && typeof status !== 'string') {
      res.status(400).json({message: 'Status must be text.'});
      return;
    }

    if (typeof status === 'string' &&
        !validStatuses.includes(status as ContentStatus)) {
      res.status(400).json({message: 'Invalid tutorial status.'});
      return;
    }

    const selectedOS = typeof os === 'string' ?
        operatingSystemMap[os as SupportedOperatingSystem] :
        undefined;

    const selectedLanguage =
        typeof language === 'string' ? normalizeLanguage(language) : undefined;

    const selectedStatus =
        typeof status === 'string' ? status as ContentStatus : undefined;

    const tutorials = await prisma.tutorial.findMany({
      where: {
        ...(selectedOS ? {os: selectedOS} : {}),
        ...(selectedLanguage ?
                {language: {equals: selectedLanguage, mode: 'insensitive'}} :
                {}),
        ...(selectedStatus ? {status: selectedStatus} : {})
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        language: true,
        os: true,
        osVersion: true,
        status: true,
        version: true,
        lastVerifiedAt: true,
        updatedAt: true
      },
      orderBy: [{language: 'asc'}, {title: 'asc'}]
    });

    res.json({
      resultCount: tutorials.length,
      tutorials,
      message: tutorials.length > 0 ? 'Tutorials found.' :
                                      'No tutorials match the selected filters.'
    });

  } catch (error) {
    console.error('Tutorial search failed:', error);

    res.status(500).json(
        {message: 'Something went wrong while searching for tutorials.'});
  }
});

/*
 * GET /api/tutorials/:id
 *
 * Accepts either a tutorial ID or its slug.
 * Returns the complete tutorial with ordered steps and sources.
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const {id} = req.params;

    if (!id || typeof id !== 'string') {
      res.status(400).json(
          {message: 'A valid tutorial ID or slug is required.'});
      return;
    }

    const tutorial = await prisma.tutorial.findFirst({
      where: {OR: [{id}, {slug: id}]},
      include:
          {steps: {orderBy: {order: 'asc'}}, sources: {orderBy: {title: 'asc'}}}
    });

    if (!tutorial) {
      res.status(404).json({message: 'Tutorial not found.'});
      return;
    }

    res.json({tutorial});

  } catch (error) {
    console.error('Tutorial details request failed:', error);

    res.status(500).json(
        {message: 'Something went wrong while loading the tutorial.'});
  }
});

export default router;
