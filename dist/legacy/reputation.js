"use strict";
// legacy/reputation.ts
// Composite reputation calculation for Mugen the Brotherhood
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateReputationScore = calculateReputationScore;
const sentiment_1 = require("./sentiment");
const held_1 = require("./held");
const guardianVotes_js_1 = require("./guardianVotes.js");
/**
 * Calculates the composite reputation score for a user.
 * Weights:
 *  - Sentiment: 30%
 *  - Time-held Azuki asset: 50%
 *  - Guardian voting: 20%
 *
 * Each sub-score should be normalized to a 0–1 range.
 */
async function calculateReputationScore(userId) {
    // Fetch each component score
    const sentimentResult = await (0, sentiment_1.getSentimentScore)(userId); // Returns {score, isEligible}
    const sentimentScore = sentimentResult.score; // Extract just the score
    const timeHeldScore = await (0, held_1.getAzukiHeldScore)(userId); // 0–1
    const guardianVoteScore = await (0, guardianVotes_js_1.getGuardianVoteScore)(userId); // 0–1
    // Composite weighted score
    const compositeScore = (sentimentScore * 0.3 +
        timeHeldScore * 0.5 +
        guardianVoteScore * 0.2);
    // Return the composite score (already in 0–1 range)
    return compositeScore;
}
