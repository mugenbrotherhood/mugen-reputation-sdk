// legacy/reputation.ts
// Composite reputation calculation for Mugen the Brotherhood

import { getSentimentScore } from "./sentiment";
import { getAzukiHeldScore } from "./held";
import { getGuardianVoteScore } from "./guardianVotes.js";
import { MugenReputationSDK } from "../src/index";

/**
 * Calculates the composite reputation score for a user.
 * Weights:
 *  - Sentiment: 30%
 *  - Time-held Azuki asset: 50%
 *  - Guardian voting: 20%
 *
 * Each sub-score should be normalized to a 0–1 range.
 */
export async function calculateReputationScore(userId: string): Promise<number> {
  // Fetch each component score
  const sentimentResult = await getSentimentScore(userId);      // Returns {score, isEligible}
  const sentimentScore = sentimentResult.score;                // Extract just the score
  const timeHeldScore = await getAzukiHeldScore(userId);        // 0–1
  const guardianVoteScore = await getGuardianVoteScore(userId); // 0–1

  // Composite weighted score
  const compositeScore = (
    sentimentScore * 0.3 +
    timeHeldScore * 0.5 +
    guardianVoteScore * 0.2
  );

  // Return the composite score (already in 0–1 range)
  return compositeScore;
}
