/**
 * Anti-Values Linter mechanical checks (T038, contracts/anti-values-linter.md).
 * Deterministic — same input always produces the same verdict
 * (Constitution Principle IX: unit-testable without any LLM call).
 */

const JARGON_DENY_LIST = [
  "synergy",
  "synergies",
  "leverage",
  "circle back",
  "unlock value",
  "game-changer",
  "game changer",
  "low-hanging fruit",
  "move the needle",
  "best-in-class",
  "paradigm shift",
  "value-add",
  "deep dive",
  "touch base",
  "bandwidth",
  "actionable insights",
  "robust solution",
  "cutting-edge",
  "seamless",
  "holistic approach",
];

const READING_LEVEL_MAX_GRADE = 4; // "approximately 3rd grade" + small tolerance

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length === 0) return 0;
  const vowelGroups = w.match(/[aeiouy]+/g);
  let count = vowelGroups ? vowelGroups.length : 1;
  if (w.endsWith("e") && count > 1) count -= 1;
  return Math.max(count, 1);
}

/** Flesch-Kincaid Grade Level — implemented directly (no dependency) per Constitution Principle III. */
export function fleschKincaidGrade(text: string): number {
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const words = text.match(/[A-Za-z']+/g) ?? [];
  if (sentences.length === 0 || words.length === 0) return 0;

  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const wordsPerSentence = words.length / sentences.length;
  const syllablesPerWord = syllables / words.length;

  const grade = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;
  return Math.max(0, Math.round(grade * 10) / 10);
}

export function findJargonTerms(text: string): string[] {
  const lower = text.toLowerCase();
  return JARGON_DENY_LIST.filter((term) => lower.includes(term));
}

/** Body text contains an identifiable Hook, Pain, BFV-link reference, and Ask, in that order. */
export function checkStructure(text: string): boolean {
  const lower = text.toLowerCase();
  const linkIdx = text.search(/https?:\/\/t\.me\//i);
  if (linkIdx === -1) return false;

  // Heuristic: Ask is a question or call-to-action after the link;
  // Hook/Pain precede the link. Require at least ~2 sentences before the
  // link (hook+pain) and at least one sentence after (the ask).
  const before = text.slice(0, linkIdx);
  const after = text.slice(linkIdx);
  const beforeSentences = before
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const afterHasContent = after.replace(/https?:\/\/\S+/i, "").trim().length > 0;

  return beforeSentences.length >= 2 && afterHasContent && lower.length > 0;
}

export interface MechanicalCheckResult {
  readingGradeScore: number;
  readingLevelPass: boolean;
  jargonTermsFound: string[];
  jargonPass: boolean;
  structurePass: boolean;
}

export function runMechanicalChecks(bodyText: string): MechanicalCheckResult {
  const readingGradeScore = fleschKincaidGrade(bodyText);
  const jargonTermsFound = findJargonTerms(bodyText);
  const structurePass = checkStructure(bodyText);

  return {
    readingGradeScore,
    readingLevelPass: readingGradeScore <= READING_LEVEL_MAX_GRADE,
    jargonTermsFound,
    jargonPass: jargonTermsFound.length === 0,
    structurePass,
  };
}
