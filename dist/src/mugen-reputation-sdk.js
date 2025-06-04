"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MugenReputationSDK = void 0;
// src/mugen-reputation-sdk.ts
const config_1 = require("./config");
const nft_holding_1 = require("./core/nft-holding");
const sentiment_analyzer_1 = require("./core/sentiment-analyzer");
const guardian_voting_1 = require("./core/guardian-voting");
class MugenReputationSDK {
    constructor(customConfig = {}) {
        // Merge custom config with defaults
        this.config = this.mergeConfig(config_1.defaultConfig, customConfig);
        // Validate configuration
        (0, config_1.validateConfig)(this.config);
        // Initialize analyzers
        this.nftAnalyzer = new nft_holding_1.NFTHoldingAnalyzer(this.config);
        this.sentimentAnalyzer = new sentiment_analyzer_1.SentimentAnalyzer(this.config);
        this.guardianAnalyzer = new guardian_voting_1.GuardianVotingAnalyzer(this.config);
    }
    /**
     * Calculate comprehensive reputation score for a user
     * @param userId - Unique user identifier
     * @param walletAddress - Optional Ethereum wallet address
     * @param twitterUsername - Optional Twitter username (without @)
     * @returns Promise<ReputationScore> with detailed breakdown
     */
    async calculateReputation(userId, walletAddress, twitterUsername) {
        console.log(`Starting reputation analysis for user: ${userId}`);
        try {
            // Run all analyses in parallel for better performance
            const [sentimentResult, holdingResult, votingResult] = await Promise.allSettled([
                twitterUsername
                    ? this.sentimentAnalyzer.analyzeSentiment(twitterUsername)
                    : Promise.resolve(this.createEmptySentimentResult()),
                walletAddress
                    ? this.nftAnalyzer.getHoldingScore(walletAddress)
                    : Promise.resolve(this.createEmptyNFTResult()),
                this.guardianAnalyzer.getVotingScore(userId),
            ]);
            // Extract scores, handling any failed promises
            const sentimentScore = this.extractScore(sentimentResult, 'sentiment');
            const holdingScore = this.extractScore(holdingResult, 'holding');
            const votingScore = this.extractScore(votingResult, 'voting');
            // Calculate weighted composite score
            const weights = this.config.scoring.weights;
            const overallScore = sentimentScore * weights.sentiment +
                holdingScore * weights.timeHeld +
                votingScore * weights.guardianVoting;
            // Determine eligibility
            const threshold = this.config.scoring.thresholds.eligibility;
            const isEligible = overallScore >= threshold;
            const eligibilityReasons = this.generateEligibilityReasons(sentimentScore, holdingScore, votingScore, threshold);
            const reputationScore = {
                overall: Math.round(overallScore * 1000) / 1000, // Round to 3 decimal places
                components: {
                    sentiment: Math.round(sentimentScore * 1000) / 1000,
                    timeHeld: Math.round(holdingScore * 1000) / 1000,
                    guardianVoting: Math.round(votingScore * 1000) / 1000,
                },
                eligibility: {
                    isEligible,
                    threshold,
                    reasons: eligibilityReasons,
                },
                metadata: {
                    analysisDate: new Date().toISOString(),
                    userId,
                    walletAddress,
                    twitterUsername,
                },
            };
            console.log(`Reputation analysis completed for ${userId}. Score: ${overallScore}`);
            return reputationScore;
        }
        catch (error) {
            console.error(`Error calculating reputation for ${userId}:`, error);
            throw new Error(`Failed to calculate reputation: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get only Twitter sentiment analysis
     */
    async getSentimentOnly(username, options) {
        return this.sentimentAnalyzer.analyzeSentiment(username, options);
    }
    /**
     * Get only NFT holding analysis
     */
    async getHoldingOnly(walletAddress) {
        return this.nftAnalyzer.getHoldingScore(walletAddress);
    }
    /**
     * Get only guardian voting analysis
     */
    async getVotingOnly(userId) {
        return this.guardianAnalyzer.getVotingScore(userId);
    }
    /**
     * Get detailed holding statistics
     */
    async getDetailedHoldingStats(walletAddress) {
        return this.nftAnalyzer.getDetailedHoldingStats(walletAddress);
    }
    /**
     * Batch analyze multiple users
     */
    async batchAnalyze(users) {
        console.log(`Starting batch analysis for ${users.length} users`);
        const results = await Promise.allSettled(users.map(user => this.calculateReputation(user.userId, user.walletAddress, user.twitterUsername)));
        return results.map((result, index) => {
            if (result.status === 'fulfilled') {
                return result.value;
            }
            else {
                console.error(`Failed to analyze user ${users[index].userId}:`, result.reason);
                // Return a default failed score
                return this.createFailedReputationScore(users[index].userId, result.reason.message);
            }
        });
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config }; // Return a copy to prevent external modification
    }
    /**
     * Update configuration (creates new analyzer instances)
     */
    updateConfig(newConfig) {
        this.config = this.mergeConfig(this.config, newConfig);
        (0, config_1.validateConfig)(this.config);
        // Reinitialize analyzers with new config
        this.nftAnalyzer = new nft_holding_1.NFTHoldingAnalyzer(this.config);
        this.sentimentAnalyzer = new sentiment_analyzer_1.SentimentAnalyzer(this.config);
        this.guardianAnalyzer = new guardian_voting_1.GuardianVotingAnalyzer(this.config);
    }
    // Private helper methods
    mergeConfig(base, override) {
        return {
            alchemy: { ...base.alchemy, ...override.alchemy },
            twitter: { ...base.twitter, ...override.twitter },
            contracts: { ...base.contracts, ...override.contracts },
            scoring: {
                weights: { ...base.scoring.weights, ...override.scoring?.weights },
                thresholds: { ...base.scoring.thresholds, ...override.scoring?.thresholds },
            },
        };
    }
    extractScore(result, type) {
        if (result.status === 'fulfilled') {
            return result.value?.score || 0;
        }
        else {
            console.warn(`${type} analysis failed:`, result.reason);
            return 0;
        }
    }
    generateEligibilityReasons(sentimentScore, holdingScore, votingScore, threshold) {
        const reasons = [];
        const weights = this.config.scoring.weights;
        if (sentimentScore < 0.4) {
            reasons.push("Twitter sentiment score below threshold");
        }
        if (holdingScore < 0.3) {
            reasons.push("Insufficient long-term NFT holding");
        }
        if (votingScore < 0.2) {
            reasons.push("Limited governance participation");
        }
        const overallScore = sentimentScore * weights.sentiment +
            holdingScore * weights.timeHeld +
            votingScore * weights.guardianVoting;
        if (overallScore < threshold) {
            reasons.push(`Overall score ${overallScore.toFixed(3)} below threshold ${threshold}`);
        }
        return reasons;
    }
    createEmptySentimentResult() {
        return {
            score: 0,
            isEligible: false,
            breakdown: {
                textSentiment: 0,
                accountAge: 0,
                engagement: 0,
                crossPlatform: 0,
                consistency: 0,
                authenticity: 0,
            },
            metadata: {
                totalTweets: 0,
                relevantTweets: 0,
                analysisDate: new Date().toISOString(),
                threshold: this.config.scoring.thresholds.eligibility,
                eligibilityReasons: ["No Twitter username provided"],
            },
            insights: {
                strongestSignal: "none",
                recommendation: "Provide Twitter username for sentiment analysis",
            }
        };
    }
    createEmptyNFTResult() {
        return {
            score: 0,
            totalNfts: 0,
            longTermHeld: 0,
            holdingRatio: 0,
            averageHoldingTime: 0,
            details: {
                message: "No wallet address provided",
                nftBreakdown: [],
            }
        };
    }
    createFailedReputationScore(userId, errorMessage) {
        return {
            overall: 0,
            components: {
                sentiment: 0,
                timeHeld: 0,
                guardianVoting: 0,
            },
            eligibility: {
                isEligible: false,
                threshold: this.config.scoring.thresholds.eligibility,
                reasons: [`Analysis failed: ${errorMessage}`],
            },
            metadata: {
                analysisDate: new Date().toISOString(),
                userId,
            },
        };
    }
}
exports.MugenReputationSDK = MugenReputationSDK;
