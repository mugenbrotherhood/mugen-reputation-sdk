/**
 * Calculates the composite reputation score for a user.
 * Weights:
 *  - Sentiment: 30%
 *  - Time-held Azuki asset: 50%
 *  - Guardian voting: 20%
 *
 * Each sub-score should be normalized to a 0–1 range.
 */
export declare function calculateReputationScore(userId: string): Promise<number>;
