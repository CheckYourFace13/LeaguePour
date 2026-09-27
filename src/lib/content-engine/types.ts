export type Brand = "LP" | "VS";

export type TopicCandidate = {
  /** Stable dedup key - never changes for a given topic, even if title wording later changes. */
  topicKey: string;
  category: string;
  title: string;
  /** One-line brief telling whoever writes the body what angle/question this topic should answer. */
  brief: string;
};

/** Deterministic classification from the title alone - no LLM. */
export type SearchIntent = "how-to" | "comparison" | "listicle" | "informational";

export type Outline = { sections: string[] };

export type CheckResult = { failures: string[]; passed: boolean };
