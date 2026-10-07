/** A guide body written and reviewed in the repo, keyed by the queued row's topicKey. */
export type AuthoredBody = {
  /** Meta description (80-170 chars) - replaces the auto-generated brief on publish. */
  description: string;
  bodyHtml: string;
  faq?: { q: string; a: string }[];
};
