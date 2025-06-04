import { MugenConfig } from "./config";
import { ReputationScore, SentimentResult, NFTHoldingResult, GuardianVotingResult } from "./types";
export declare class MugenReputationSDK {
    private config;
    private nftAnalyzer;
    private sentimentAnalyzer;
    private guardianAnalyzer;
    constructor(customConfig?: Partial<MugenConfig>);
    /**
     * Calculate comprehensive reputation score for a user
     * @param userId - Unique user identifier
     * @param walletAddress - Optional Ethereum wallet address
     * @param twitterUsername - Optional Twitter username (without @)
     * @returns Promise<ReputationScore> with detailed breakdown
     */
    calculateReputation(userId: string, walletAddress?: string, twitterUsername?: string): Promise<ReputationScore>;
    /**
     * Get only Twitter sentiment analysis
     */
    getSentimentOnly(username: string, options?: {
        tweetCount?: number;
        threshold?: number;
    }): Promise<SentimentResult>;
    /**
     * Get only NFT holding analysis
     */
    getHoldingOnly(walletAddress: string): Promise<NFTHoldingResult>;
    /**
     * Get only guardian voting analysis
     */
    getVotingOnly(userId: string): Promise<GuardianVotingResult>;
    /**
     * Get detailed holding statistics
     */
    getDetailedHoldingStats(walletAddress: string): Promise<{
        insights: {
            isWhale: boolean;
            isDiamond: boolean;
            isNewbie: boolean;
            recommendation: string;
        };
        score: number;
        totalNfts: number;
        longTermHeld: number;
        holdingRatio: number;
        averageHoldingTime: number;
        details: {
            message: string;
            nftBreakdown: Array<{
                tokenId: string;
                holdingTime: number;
                isLongTerm: boolean;
                acquiredAt?: string;
            }>;
            exceptionalHolders?: number;
        };
    }>;
    /**
     * Batch analyze multiple users
     */
    batchAnalyze(users: Array<{
        userId: string;
        walletAddress?: string;
        twitterUsername?: string;
    }>): Promise<ReputationScore[]>;
    /**
     * Get current configuration
     */
    getConfig(): MugenConfig;
    /**
     * Update configuration (creates new analyzer instances)
     */
    updateConfig(newConfig: Partial<MugenConfig>): void;
    private mergeConfig;
    private extractScore;
    private generateEligibilityReasons;
    private createEmptySentimentResult;
    private createEmptyNFTResult;
    private createFailedReputationScore;
}
