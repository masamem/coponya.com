/**
 * Store review moderation core.
 * This module deliberately does not publish directly or trust a client-provided user ID.
 * Integrate with verified server-side authentication and persistent storage before enabling.
 */
export type ReviewStatus = "published" | "pending_review" | "rejected";
export type ReviewDecision = { status: ReviewStatus; reasons: string[] };
export type ReviewInput = { storeId: string; rating: number; comment: string };

const URL = /(?:https?:\/\/|www\.)\S+/iu;
const CONTACT = /(?:[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:\+?966|0)5\d{8})/iu;
const SPAM = /(.)\1{12,}/u;
const THREATS = /(?:سأقتلك|سوف أقتلك|اقتل|تهديد بالقتل|kill you|death threat)/iu;
const ALLEGATIONS = /(?:نصاب|محتال|حرامي|سرقني|تزوير|fraud|scammer|thief)/iu;

export function validateReview(input: ReviewInput): string[] {
  const errors: string[] = [];
  if (!input.storeId || input.storeId.length > 120) errors.push("invalid_store");
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) errors.push("invalid_rating");
  if (!input.comment || input.comment.trim().length < 10 || input.comment.length > 2000) errors.push("invalid_comment_length");
  return errors;
}

export function screenReview(input: ReviewInput): ReviewDecision {
  const errors = validateReview(input);
  if (errors.length) return { status: "rejected", reasons: errors };
  const comment = input.comment.normalize("NFKC").trim();
  const reasons: string[] = [];
  if (URL.test(comment)) reasons.push("external_link");
  if (CONTACT.test(comment)) reasons.push("personal_contact");
  if (SPAM.test(comment)) reasons.push("repeated_text");
  if (THREATS.test(comment)) reasons.push("potential_threat");
  if (ALLEGATIONS.test(comment)) reasons.push("potential_unverified_allegation");
  return reasons.length
    ? { status: "pending_review", reasons }
    : { status: "published", reasons: [] };
}

/**
 * Screening is triage, not a legal determination or a complete safety filter.
 * Production must also enforce:
 * - server-authenticated user identity and authorization
 * - one review per (user, store) via a DB unique constraint
 * - durable storage and audit trail for all moderation decisions
 * - rate limiting, abuse reporting, merchant replies and appeals
 * - human review for flagged/ambiguous content, including false negatives
 * - no public access to pending/rejected reviews
 * - privacy/retention rules and published community guidelines
 */
