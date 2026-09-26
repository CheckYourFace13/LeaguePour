export type Brand = "LP" | "VS";

export type TopicCandidate = {
  /** Stable dedup key - never changes for a given topic, even if title wording later changes. */
  topicKey: string;
  category: string;
  title: string;
  /** One-line brief telling the writer what angle/question this topic should answer. */
  brief: string;
};

export type ArticleDraft = {
  slug: string;
  title: string;
  description: string;
  category: string;
  bodyHtml: string;
  faq: { q: string; a: string }[] | null;
};

export type QualityScore = {
  originality: number;
  usefulness: number;
  depth: number;
  productAccuracy: number;
  duplicationRisk: number;
  seoCompleteness: number;
  readability: number;
  total: number;
  maxTotal: number;
  passed: boolean;
  deterministicFailures: string[];
  notes: string;
};
