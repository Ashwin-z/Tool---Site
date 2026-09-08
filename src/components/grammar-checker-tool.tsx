"use client";

import { useMemo, useState, useCallback } from "react";

/* ─────────────────────── types ─────────────────────── */

interface GrammarIssue {
  /** byte-offset in the original string */
  start: number;
  end: number;
  /** matched fragment */
  fragment: string;
  /** human-readable message */
  message: string;
  /** suggested replacement (empty string = just a warning) */
  suggestion: string;
  /** severity colour key */
  severity: "error" | "warning" | "info";
  /** rule id (for dedup / grouping) */
  rule: string;
}

/* ─────────────────── rule engine ────────────────────── */

/** helper — escape regex special chars */
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** common confused-word pairs: pattern → message + suggestion */
const CONFUSED_WORDS: {
  pattern: RegExp;
  message: string;
  suggest: (m: RegExpMatchArray) => string;
}[] = [
  {
    pattern: /\btheir\b(?=\s+(?:is|was|are|were|has|have|will|shall|can|could|would|should|may|might)\b)/gi,
    message: '"their" (possessive) may be incorrect here — did you mean "there"?',
    suggest: () => "there",
  },
  {
    pattern: /\bthere\b(?=\s+\w+(?:s|ed|ing)\b)/gi,
    message: '"there" may be incorrect — did you mean "their" (possessive)?',
    suggest: () => "their",
  },
  {
    pattern: /\byour\b(?=\s+(?:is|was|are|were|going|doing|being|welcome|right|wrong|correct)\b)/gi,
    message: '"your" (possessive) may be incorrect — did you mean "you\'re"?',
    suggest: () => "you're",
  },
  {
    pattern: /\bits\b(?=\s+(?:a|an|the|not|very|been|going|important|necessary|possible|clear|obvious)\b)/gi,
    message: '"its" (possessive) may be incorrect — did you mean "it\'s"?',
    suggest: () => "it's",
  },
  {
    pattern: /\bthen\b(?=\s+\w+(?:er)\b)/gi,
    message: '"then" (time) may be incorrect in a comparison — did you mean "than"?',
    suggest: () => "than",
  },
  {
    pattern: /\baffect\b(?=\s+(?:is|was|of|the|on|a)\b)/gi,
    message: '"affect" (verb) may be incorrect here — did you mean "effect" (noun)?',
    suggest: () => "effect",
  },
  {
    pattern: /\beffect\b(?=\s+(?:the|a|an|your|my|our|his|her|their|this|that)\b)/gi,
    message: 'When used as a verb meaning "to influence", "affect" is usually correct.',
    suggest: () => "affect",
  },
  {
    pattern: /\bto\b(?=\s+\w+\s+to\b)/gi,
    message: 'Possible double "to" — check if "too" (meaning also/very) was intended.',
    suggest: () => "too",
  },
  {
    pattern: /\blose\b(?=\s+(?:fitting|cannon|end|leaf|change)\b)/gi,
    message: '"lose" (verb) may be incorrect — did you mean "loose" (adjective)?',
    suggest: () => "loose",
  },
  {
    pattern: /\bwho's\b(?=\s+\w+\b)/gi,
    message: '"who\'s" = "who is". If you mean belonging to whom, use "whose".',
    suggest: () => "whose",
  },
];

/** common misspellings: wrong → correct */
const MISSPELLINGS: Record<string, string> = {
  abotu: "about",
  abuot: "about",
  accomodate: "accommodate",
  acheive: "achieve",
  accross: "across",
  agian: "again",
  agressive: "aggressive",
  alot: "a lot",
  alright: "all right",
  amd: "and",
  amke: "make",
  adn: "and",
  apparantly: "apparently",
  arguement: "argument",
  aslo: "also",
  awya: "away",
  basicly: "basically",
  becasue: "because",
  becuase: "because",
  beacuse: "because",
  begining: "beginning",
  beleive: "believe",
  belive: "believe",
  breif: "brief",
  buisness: "business",
  calender: "calendar",
  catagory: "category",
  changable: "changeable",
  claer: "clear",
  chnage: "change",
  collegue: "colleague",
  comming: "coming",
  commitee: "committee",
  completly: "completely",
  concious: "conscious",
  coudl: "could",
  curiousity: "curiosity",
  dau: "day",
  definately: "definitely",
  definatly: "definitely",
  desing: "design",
  dilemna: "dilemma",
  disapear: "disappear",
  dissapoint: "disappoint",
  doign: "doing",
  donw: "down",
  dont: "don't",
  doesnt: "doesn't",
  didnt: "didn't",
  embarass: "embarrass",
  enviroment: "environment",
  evey: "every",
  exagerate: "exaggerate",
  excercise: "exercise",
  existance: "existence",
  experiance: "experience",
  familar: "familiar",
  feilds: "fields",
  finaly: "finally",
  firt: "first",
  foriegn: "foreign",
  fourty: "forty",
  freind: "friend",
  frist: "first",
  form: "from",
  goign: "going",
  goverment: "government",
  gaurd: "guard",
  happend: "happened",
  harrass: "harass",
  haveing: "having",
  hte: "the",
  htey: "they",
  humourous: "humorous",
  iam: "I am",
  immediatly: "immediately",
  independant: "independent",
  inteligence: "intelligence",
  intresting: "interesting",
  jsut: "just",
  knwo: "know",
  knowlege: "knowledge",
  liason: "liaison",
  libary: "library",
  liek: "like",
  maintainance: "maintenance",
  makeing: "making",
  millenium: "millennium",
  mispell: "misspell",
  mkae: "make",
  nwo: "now",
  nto: "not",
  neccessary: "necessary",
  noticable: "noticeable",
  occassion: "occasion",
  occurence: "occurrence",
  occured: "occurred",
  oficial: "official",
  oportunity: "opportunity",
  oen: "one",
  owrk: "work",
  parliment: "parliament",
  passtime: "pastime",
  peopel: "people",
  perseverence: "perseverance",
  posession: "possession",
  prefered: "preferred",
  priviledge: "privilege",
  prety: "pretty",
  probaly: "probably",
  proffesional: "professional",
  pronounciation: "pronunciation",
  publically: "publicly",
  realy: "really",
  recieve: "receive",
  reccomend: "recommend",
  refrence: "reference",
  relevent: "relevant",
  religous: "religious",
  remeber: "remember",
  repetition: "repetition",
  resistence: "resistance",
  responsable: "responsible",
  rythm: "rhythm",
  saem: "same",
  seize: "seize",
  sentance: "sentence",
  seperate: "separate",
  sergent: "sergeant",
  shoudl: "should",
  smae: "same",
  soem: "some",
  somthing: "something",
  succesful: "successful",
  suprise: "surprise",
  taht: "that",
  teh: "the",
  tendancy: "tendency",
  thats: "that's",
  thet: "that",
  therefor: "therefore",
  thier: "their",
  thign: "thing",
  thigns: "things",
  thnig: "thing",
  thsi: "this",
  tihs: "this",
  tiem: "time",
  todya: "today",
  tommorow: "tomorrow",
  tommorrow: "tomorrow",
  tounge: "tongue",
  truely: "truly",
  unforseen: "unforeseen",
  unfortunatly: "unfortunately",
  untill: "until",
  veyr: "very",
  waht: "what",
  wanna: "want to",
  wath: "what",
  wehn: "when",
  wierd: "weird",
  wellfare: "welfare",
  wether: "whether",
  wich: "which",
  whcih: "which",
  wiht: "with",
  wnat: "want",
  wokr: "work",
  woudl: "would",
  writting: "writing",
  yera: "year",
  yoru: "your",
  yuor: "your",
};

const VOWEL_SOUNDS = /^(a|e|i|o|u|8|11|18|80|hour|honest|honor|honour|heir|herb)/i;

/* ─────────────────── main checker ────────────────────── */

function checkGrammar(text: string): GrammarIssue[] {
  if (!text.trim()) return [];

  const issues: GrammarIssue[] = [];

  /* 1 ─ Double / repeated words */
  const doubleWordRe = /\b(\w{2,})\s+\1\b/gi;
  let m: RegExpExecArray | null;
  while ((m = doubleWordRe.exec(text)) !== null) {
    issues.push({
      start: m.index,
      end: m.index + m[0].length,
      fragment: m[0],
      message: `Repeated word "${m[1]}".`,
      suggestion: m[1],
      severity: "error",
      rule: "double-word",
    });
  }

  /* 2 ─ Capitalization after sentence-ending punctuation */
  const capAfterRe = /([.!?])\s+([a-z])/g;
  while ((m = capAfterRe.exec(text)) !== null) {
    const lowerChar = m[2];
    issues.push({
      start: m.index,
      end: m.index + m[0].length,
      fragment: m[0],
      message: `Sentence should start with a capital letter after "${m[1]}".`,
      suggestion: `${m[1]} ${lowerChar.toUpperCase()}`,
      severity: "error",
      rule: "cap-after-punct",
    });
  }

  /* 3 ─ First character of text not capitalised */
  const firstCharMatch = text.match(/^\s*([a-z])/);
  if (firstCharMatch && firstCharMatch.index !== undefined) {
    const idx = text.indexOf(firstCharMatch[1], firstCharMatch.index);
    issues.push({
      start: idx,
      end: idx + 1,
      fragment: firstCharMatch[1],
      message: "Text should start with a capital letter.",
      suggestion: firstCharMatch[1].toUpperCase(),
      severity: "error",
      rule: "cap-first",
    });
  }

  /* 4 ─ "a" before vowel / "an" before consonant */
  const aAnRe = /\b(a|an)\s+(\w+)/gi;
  while ((m = aAnRe.exec(text)) !== null) {
    const article = m[1].toLowerCase();
    const nextWord = m[2];
    const needsAn = VOWEL_SOUNDS.test(nextWord);
    if (article === "a" && needsAn) {
      issues.push({
        start: m.index,
        end: m.index + m[0].length,
        fragment: m[0],
        message: `Use "an" before "${nextWord}" (vowel sound).`,
        suggestion: `an ${nextWord}`,
        severity: "error",
        rule: "a-an",
      });
    } else if (article === "an" && !needsAn) {
      issues.push({
        start: m.index,
        end: m.index + m[0].length,
        fragment: m[0],
        message: `Use "a" before "${nextWord}" (consonant sound).`,
        suggestion: `a ${nextWord}`,
        severity: "error",
        rule: "a-an",
      });
    }
  }

  /* 5 ─ Missing space after punctuation */
  const missingSpaceRe = /([.!?,;:])([A-Za-z])/g;
  while ((m = missingSpaceRe.exec(text)) !== null) {
    // skip common patterns like URLs, abbreviations, file extensions
    const before = text.slice(Math.max(0, m.index - 5), m.index);
    if (/[A-Za-z]\./.test(before + m[1]) && /[a-z]/.test(m[2])) {
      // likely abbreviation like "e.g." or "U.S.A." — skip
      continue;
    }
    issues.push({
      start: m.index,
      end: m.index + m[0].length,
      fragment: m[0],
      message: `Missing space after "${m[1]}".`,
      suggestion: `${m[1]} ${m[2]}`,
      severity: "warning",
      rule: "missing-space-after-punct",
    });
  }

  /* 6 ─ Double spaces */
  const doubleSpaceRe = / {2,}/g;
  while ((m = doubleSpaceRe.exec(text)) !== null) {
    issues.push({
      start: m.index,
      end: m.index + m[0].length,
      fragment: m[0],
      message: "Multiple consecutive spaces.",
      suggestion: " ",
      severity: "warning",
      rule: "double-space",
    });
  }

  /* 7 ─ Confused words */
  for (const rule of CONFUSED_WORDS) {
    const re = new RegExp(rule.pattern.source, rule.pattern.flags);
    while ((m = re.exec(text)) !== null) {
      issues.push({
        start: m.index,
        end: m.index + m[0].length,
        fragment: m[0],
        message: rule.message,
        suggestion: rule.suggest(m),
        severity: "info",
        rule: "confused-word",
      });
    }
  }

  /* 8 ─ Common misspellings */
  const wordsInText = text.matchAll(/\b[a-zA-Z]+\b/g);
  for (const wm of wordsInText) {
    const lower = wm[0].toLowerCase();
    if (MISSPELLINGS[lower]) {
      const correction = MISSPELLINGS[lower];
      // preserve original casing of first char
      const cased =
        wm[0][0] === wm[0][0].toUpperCase()
          ? correction.charAt(0).toUpperCase() + correction.slice(1)
          : correction;
      issues.push({
        start: wm.index!,
        end: wm.index! + wm[0].length,
        fragment: wm[0],
        message: `Possible misspelling of "${wm[0]}".`,
        suggestion: cased,
        severity: "error",
        rule: "misspelling",
      });
    }
  }

  /* 9 ─ Very long sentences (run-on warning) */
  const sentenceChunks = text.split(/[.!?]+/).filter((s) => s.trim());
  for (const chunk of sentenceChunks) {
    const wordCount = chunk.trim().split(/\s+/).length;
    if (wordCount > 45) {
      const idx = text.indexOf(chunk.trim().slice(0, 30));
      if (idx !== -1) {
        issues.push({
          start: idx,
          end: idx + Math.min(chunk.trim().length, 60),
          fragment: chunk.trim().slice(0, 60) + "…",
          message: `Very long sentence (${wordCount} words). Consider breaking it up.`,
          suggestion: "",
          severity: "info",
          rule: "run-on",
        });
      }
    }
  }

  /* 10 ─ Missing ending punctuation */
  const trimmed = text.trimEnd();
  if (trimmed.length > 0 && !/[.!?)"'\u201D]$/.test(trimmed)) {
    issues.push({
      start: trimmed.length - 1,
      end: trimmed.length,
      fragment: trimmed.slice(-1),
      message: "Text does not end with punctuation.",
      suggestion: trimmed.slice(-1) + ".",
      severity: "warning",
      rule: "missing-end-punct",
    });
  }

  /* 11 ─ Whitespace before punctuation */
  const spaceBeforePunctRe = /\s+([.!?,;:])/g;
  while ((m = spaceBeforePunctRe.exec(text)) !== null) {
    issues.push({
      start: m.index,
      end: m.index + m[0].length,
      fragment: m[0],
      message: `Unexpected space before "${m[1]}".`,
      suggestion: m[1],
      severity: "warning",
      rule: "space-before-punct",
    });
  }

  /* 12 ─ was/were + base verb (should be -ing form) */
  const BASE_VERBS: Record<string, string> = {
    do: "doing", go: "going", make: "making", take: "taking", come: "coming",
    give: "giving", get: "getting", run: "running", sit: "sitting", eat: "eating",
    write: "writing", read: "reading", play: "playing", work: "working", try: "trying",
    say: "saying", tell: "telling", think: "thinking", look: "looking", find: "finding",
    walk: "walking", talk: "talking", sleep: "sleeping", drive: "driving", watch: "watching",
    wait: "waiting", help: "helping", move: "moving", live: "living", start: "starting",
    stop: "stopping", call: "calling", ask: "asking", use: "using", put: "putting",
    leave: "leaving", keep: "keeping", hold: "holding", stand: "standing", show: "showing",
    build: "building", buy: "buying", send: "sending", fall: "falling", cut: "cutting",
    sing: "singing", speak: "speaking", bring: "bringing", pay: "paying", feel: "feeling",
    learn: "learning", change: "changing", lead: "leading", set: "setting", lose: "losing",
    create: "creating", happen: "happening", carry: "carrying", dance: "dancing",
    cook: "cooking", clean: "cleaning", draw: "drawing", fight: "fighting",
    fly: "flying", grow: "growing", hide: "hiding", hit: "hitting", jump: "jumping",
    laugh: "laughing", listen: "listening", open: "opening", plan: "planning",
    pull: "pulling", push: "pushing", ride: "riding", teach: "teaching",
    throw: "throwing", turn: "turning", wash: "washing", win: "winning",
  };
  const wasWereRe = /\b(was|were)\s+(\w+)\b/gi;
  while ((m = wasWereRe.exec(text)) !== null) {
    const verb = m[2].toLowerCase();
    if (BASE_VERBS[verb]) {
      issues.push({
        start: m.index,
        end: m.index + m[0].length,
        fragment: m[0],
        message: `"${m[1]} ${m[2]}" — use the -ing form after "${m[1]}".`,
        suggestion: `${m[1]} ${BASE_VERBS[verb]}`,
        severity: "error",
        rule: "was-were-base-verb",
      });
    }
  }

  /* 13 ─ Subject-verb agreement: "I is", "he are", "they is" etc. */
  const svPatterns: [RegExp, string, string][] = [
    [/\bI\s+is\b/gi, '"I is" — use "I am".', "I am"],
    [/\bI\s+are\b/gi, '"I are" — use "I am".', "I am"],
    [/\bI\s+has\b/gi, '"I has" — use "I have".', "I have"],
    [/\bI\s+were\b/g, '"I were" — use "I was" (unless subjunctive).', "I was"],
    [/\b(he|she|it)\s+are\b/gi, 'Use "is" with he/she/it.', ""],
    [/\b(he|she|it)\s+have\b/gi, 'Use "has" with he/she/it.', ""],
    [/\b(he|she|it)\s+were\b/gi, 'Use "was" with he/she/it.', ""],
    [/\b(we|they)\s+is\b/gi, 'Use "are" with we/they.', ""],
    [/\b(we|they)\s+was\b/gi, 'Use "were" with we/they.', ""],
    [/\b(we|they)\s+has\b/gi, 'Use "have" with we/they.', ""],
  ];
  for (const [pattern, message, suggest] of svPatterns) {
    const re = new RegExp(pattern.source, pattern.flags);
    while ((m = re.exec(text)) !== null) {
      const sub = m[1] || m[0].split(/\s/)[0];
      const verb = m[0].split(/\s/).pop() || "";
      const corrected =
        suggest ||
        `${sub} ${
          verb === "is" ? "are" : verb === "are" ? "is" : verb === "was" ? "were" : verb === "were" ? "was" : verb === "has" ? "have" : verb === "have" ? "has" : verb
        }`;
      issues.push({
        start: m.index,
        end: m.index + m[0].length,
        fragment: m[0],
        message,
        suggestion: corrected,
        severity: "error",
        rule: "subject-verb-agreement",
      });
    }
  }

  /* 14 ─ Missing apostrophe in common contractions */
  const contractions: [RegExp, string, string][] = [
    [/\bi\s+am\b/gi, 'Consider the contraction "I\'m".', "I'm"],
    [/\bcant\b/gi, '"cant" should be "can\'t".', "can't"],
    [/\bwont\b/gi, '"wont" should be "won\'t".', "won't"],
    [/\bisnt\b/gi, '"isnt" should be "isn\'t".', "isn't"],
    [/\barent\b/gi, '"arent" should be "aren\'t".', "aren't"],
    [/\bwerent\b/gi, '"werent" should be "weren\'t".', "weren't"],
    [/\bwasnt\b/gi, '"wasnt" should be "wasn\'t".', "wasn't"],
    [/\bcouldnt\b/gi, '"couldnt" should be "couldn\'t".', "couldn't"],
    [/\bwouldnt\b/gi, '"wouldnt" should be "wouldn\'t".', "wouldn't"],
    [/\bshouldnt\b/gi, '"shouldnt" should be "shouldn\'t".', "shouldn't"],
    [/\bhasnt\b/gi, '"hasnt" should be "hasn\'t".', "hasn't"],
    [/\bhavent\b/gi, '"havent" should be "haven\'t".', "haven't"],
    [/\bhadnt\b/gi, '"hadnt" should be "hadn\'t".', "hadn't"],
    [/\bive\b/gi, '"ive" should be "I\'ve".', "I've"],
    [/\bim\b/gi, '"im" should be "I\'m".', "I'm"],
    [/\btheres\b/gi, '"theres" should be "there\'s".', "there's"],
    [/\bheres\b/gi, '"heres" should be "here\'s".', "here's"],
  ];
  for (const [pattern, message, suggest] of contractions) {
    const re = new RegExp(pattern.source, pattern.flags);
    while ((m = re.exec(text)) !== null) {
      issues.push({
        start: m.index,
        end: m.index + m[0].length,
        fragment: m[0],
        message,
        suggestion: suggest,
        severity: "warning",
        rule: "missing-apostrophe",
      });
    }
  }

  // sort by position
  issues.sort((a, b) => a.start - b.start);

  // de-duplicate overlapping issues (keep higher severity)
  const severityRank: Record<string, number> = { error: 3, warning: 2, info: 1 };
  const deduped: GrammarIssue[] = [];
  for (const issue of issues) {
    const last = deduped[deduped.length - 1];
    if (last && issue.start < last.end) {
      // overlapping — keep the one with higher severity
      if (severityRank[issue.severity] > severityRank[last.severity]) {
        deduped[deduped.length - 1] = issue;
      }
      continue;
    }
    deduped.push(issue);
  }

  return deduped;
}

/* ─────────────── severity config ───────────────────── */

const SEVERITY_CONFIG = {
  error: { bg: "bg-red-500/20", border: "border-red-500/40", text: "text-red-400", label: "Error", dot: "bg-red-400" },
  warning: { bg: "bg-amber-500/20", border: "border-amber-500/40", text: "text-amber-400", label: "Warning", dot: "bg-amber-400" },
  info: { bg: "bg-blue-500/20", border: "border-blue-500/40", text: "text-blue-400", label: "Suggestion", dot: "bg-blue-400" },
};

/* ─────────────── component ─────────────────────────── */

export default function GrammarCheckerTool() {
  const [text, setText] = useState("");
  const [issues, setIssues] = useState<GrammarIssue[]>([]);
  const [checked, setChecked] = useState(false);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const sentences = !text.trim() ? 0 : (text.match(/[.!?]+/g) || []).length || 1;
    const readingSeconds = Math.ceil(words / 3.3);
    const readTime =
      words === 0
        ? "—"
        : readingSeconds < 60
        ? `${readingSeconds}s`
        : `${Math.ceil(readingSeconds / 60)} min`;
    return { words, chars, sentences, readTime };
  }, [text]);

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const infoCount = issues.filter((i) => i.severity === "info").length;

  const runCheck = useCallback(() => {
    setIssues(checkGrammar(text));
    setChecked(true);
  }, [text]);

  const applySuggestion = (issue: GrammarIssue) => {
    if (!issue.suggestion) return;
    const before = text.slice(0, issue.start);
    const after = text.slice(issue.end);
    const newText = before + issue.suggestion + after;
    setText(newText);
    // re-check after applying
    const newIssues = checkGrammar(newText);
    setIssues(newIssues);
  };

  const applyAll = () => {
    let result = text;
    // apply from end to start so indices remain valid
    const sorted = [...issues].filter((i) => i.suggestion).sort((a, b) => b.start - a.start);
    for (const issue of sorted) {
      result = result.slice(0, issue.start) + issue.suggestion + result.slice(issue.end);
    }
    setText(result);
    const newIssues = checkGrammar(result);
    setIssues(newIssues);
  };

  const copyText = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* */
    }
  };

  const clearAll = () => {
    setText("");
    setIssues([]);
    setChecked(false);
  };

  /* Build highlighted preview */
  const highlightedPreview = useMemo(() => {
    if (!checked || issues.length === 0) return null;

    const parts: { text: string; issue?: GrammarIssue }[] = [];
    let lastIdx = 0;

    for (const issue of issues) {
      if (issue.start > lastIdx) {
        parts.push({ text: text.slice(lastIdx, issue.start) });
      }
      parts.push({ text: text.slice(issue.start, issue.end), issue });
      lastIdx = issue.end;
    }
    if (lastIdx < text.length) {
      parts.push({ text: text.slice(lastIdx) });
    }

    return parts;
  }, [text, issues, checked]);

  return (
    <div className="space-y-4">
      {/* ── Input card ── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#6c63ff]" />
            <h2 className="font-display text-sm font-bold tracking-tight">
              Grammar Checker
            </h2>
            {checked && (
              <span className="ml-2 rounded bg-surface-3/50 px-2 py-0.5 text-[10px] text-muted">
                {issues.length === 0 ? "✓ No issues found" : `${issues.length} issue${issues.length > 1 ? "s" : ""}`}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={clearAll}
              className="rounded-md border border-border-strong px-3 py-1.5 text-muted transition hover:text-foreground"
            >
              Clear
            </button>
            <button
              onClick={copyText}
              className="rounded-md border border-border-strong px-3 py-1.5 text-muted transition hover:text-foreground"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={runCheck}
              disabled={!text.trim()}
              className="rounded-md bg-[#6c63ff] px-4 py-1.5 font-semibold text-white transition hover:bg-[#5b53ee] disabled:opacity-40"
            >
              Check Grammar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_210px]">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (checked) {
                setChecked(false);
                setIssues([]);
              }
            }}
            placeholder={`Paste or type your text here…\n\nThen click "Check Grammar" to scan for:\n• Spelling mistakes\n• Capitalization errors\n• Repeated words\n• a/an usage\n• Confused words (their/there, your/you're…)\n• Missing punctuation\n• Run-on sentences\n• And more…`}
            className="min-h-[320px] w-full resize-none border-r border-border bg-transparent px-5 py-4 text-sm leading-8 text-white outline-none placeholder:text-muted-3"
          />

          {/* Stats sidebar */}
          <div className="space-y-2 p-3">
            <Stat label="Words" value={stats.words.toLocaleString()} color="text-[#6c63ff]" />
            <Stat label="Characters" value={stats.chars.toLocaleString()} color="text-[#ff6584]" />
            <Stat label="Sentences" value={stats.sentences.toLocaleString()} color="text-[#38d9a9]" />
            <Stat label="Read time" value={stats.readTime} color="text-[#ffa640]" />
            {checked && (
              <>
                <div className="my-2 h-px bg-surface-3" />
                <Stat label="Errors" value={String(errorCount)} color="text-red-400" />
                <Stat label="Warnings" value={String(warningCount)} color="text-amber-400" />
                <Stat label="Suggestions" value={String(infoCount)} color="text-blue-400" />
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Score card ── */}
      {checked && (
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full border-[3px] font-display text-xl font-bold ${
                issues.length === 0
                  ? "border-[#38d9a9] text-[#38d9a9]"
                  : issues.length <= 3
                  ? "border-amber-400 text-amber-400"
                  : "border-red-400 text-red-400"
              }`}
            >
              {Math.max(0, 100 - issues.length * 5)}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                {issues.length === 0
                  ? "Excellent — no issues found!"
                  : issues.length <= 3
                  ? "Good — just a few things to polish."
                  : "Needs work — review the issues below."}
              </div>
              <div className="text-xs text-muted">
                {issues.length} issue{issues.length !== 1 ? "s" : ""} detected across {stats.sentences} sentence{stats.sentences !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          {issues.length > 0 && issues.some((i) => i.suggestion) && (
            <button
              onClick={applyAll}
              className="ml-auto rounded-lg bg-[#38d9a9]/15 px-4 py-2 text-xs font-semibold text-[#6ee7b7] transition hover:bg-[#38d9a9]/25"
            >
              Fix All ({issues.filter((i) => i.suggestion).length})
            </button>
          )}
        </div>
      )}

      {/* ── Highlighted preview ── */}
      {highlightedPreview && highlightedPreview.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-5 py-3">
            <h3 className="flex items-center gap-2 font-display text-sm font-bold tracking-tight text-white">
              <span className="h-2 w-2 rounded-full bg-[#ff6584]" />
              Highlighted Preview
            </h3>
          </div>
          <div className="px-5 py-4 text-sm leading-8 text-[#cccce0]">
            {highlightedPreview.map((part, i) =>
              part.issue ? (
                <span
                  key={i}
                  title={part.issue.message}
                  className={`cursor-help rounded-sm border-b-2 px-0.5 ${
                    part.issue.severity === "error"
                      ? "border-red-400/60 bg-red-500/15"
                      : part.issue.severity === "warning"
                      ? "border-amber-400/60 bg-amber-500/15"
                      : "border-blue-400/60 bg-blue-500/15"
                  }`}
                >
                  {part.text}
                </span>
              ) : (
                <span key={i}>{part.text}</span>
              )
            )}
          </div>
        </div>
      )}

      {/* ── Issue list ── */}
      {checked && issues.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-display text-sm font-bold text-white">Issues</h3>
          {issues.map((issue, i) => {
            const cfg = SEVERITY_CONFIG[issue.severity];
            return (
              <div
                key={`${issue.start}-${issue.rule}-${i}`}
                className={`flex flex-wrap items-start gap-3 rounded-xl border ${cfg.border} ${cfg.bg} px-4 py-3`}
              >
                <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${cfg.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.text}`}>
                      {cfg.label}
                    </span>
                    <span className="rounded bg-surface-3/50 px-1.5 py-0.5 font-mono text-[10px] text-muted">
                      {issue.rule}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#cccce0]">{issue.message}</p>
                  {issue.fragment && (
                    <p className="mt-1 text-xs text-muted">
                      Found: <span className="font-mono text-white/70">&quot;{issue.fragment}&quot;</span>
                    </p>
                  )}
                </div>
                {issue.suggestion && (
                  <button
                    onClick={() => applySuggestion(issue)}
                    className="shrink-0 rounded-lg border border-border-strong bg-surface-3/50 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-surface-3"
                  >
                    Fix → <span className="text-[#6ee7b7]">{issue.suggestion}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Rules reference ── */}
      <div className="rounded-2xl border border-border bg-surface px-5 py-4">
        <h3 className="font-display text-sm font-bold text-white">What we check for</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-muted sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Repeated / double words",
            "Capitalization after punctuation",
            "First-letter capitalization",
            "a/an article usage",
            "Missing space after punctuation",
            "Double spaces",
            "Confused words (their/there…)",
            "200+ common misspellings & typos",
            "Run-on sentences (45+ words)",
            "Missing ending punctuation",
            "Space before punctuation",
            "was/were + wrong verb form",
            "Subject-verb agreement",
            "Missing apostrophes in contractions",
          ].map((rule) => (
            <div key={rule} className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-[#6c63ff]" />
              {rule}
            </div>
          ))}
        </div>
        <p className="mt-3 text-[10px] text-muted-2">
          This is a rule-based grammar checker. For advanced grammar and style suggestions, consider using
          tools powered by AI language models.
        </p>
      </div>
    </div>
  );
}

/* ── helper component ── */
function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 px-3 py-2.5">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-2">{label}</div>
      <div className={`font-display text-2xl font-bold leading-none ${color}`}>{value}</div>
    </div>
  );
}
