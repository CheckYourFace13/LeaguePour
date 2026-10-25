/** A guide body written and reviewed in the repo, keyed by the queued row's topicKey. */
export type AuthoredBody = {
  /** Meta description (80-170 chars) - replaces the auto-generated brief on publish. */
  description: string;
  bodyHtml: string;
  faq?: { q: string; a: string }[];
  /**
   * Editorial revision of an already-PUBLISHED guide. Set this (ISO date) when you correct a body
   * after it went live: on the next boot, a published copy last modified before this date is
   * replaced with this body - title and slug unchanged - but only if it passes the same quality
   * gate as a first publish (publish.ts applyAuthoredRevisions). Leave unset for never-published bodies.
   */
  revisedAt?: string;
};
