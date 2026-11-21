/** A guide body written and reviewed in the repo, keyed by the queued row's topicKey. */
export type AuthoredBody = {
  /**
   * Optional replacement for the queued topic's title (and slug), applied only while the row is
   * still unpublished. Use it when the topic title fails the gate's near-duplicate check.
   */
  title?: string;
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
