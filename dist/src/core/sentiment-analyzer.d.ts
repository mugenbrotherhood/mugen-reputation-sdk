import { MugenConfig } from "../config";
import { SentimentResult } from "../types";
export declare class SentimentAnalyzer {
    private twitter;
    private sentiment;
    private config;
    constructor(config: MugenConfig);
    /**
     * Analyze Twitter sentiment for a user with comprehensive scoring
     * @param username - Twitter username (without @)
     * @param options - Analysis options
     * @returns Promise<SentimentResult> with detailed breakdown
     */
    analyzeSentiment(username: string, options?: {
        tweetCount?: number;
        threshold?: number;
        includeReplies?: boolean;
    }): Promise<SentimentResult>;
    private fetchUserTweets;
    private filterRelevantTweets;
    private calculateTextSentiment;
    private calculateAccountAgeScore;
    private calculateEngagementScore;
    private calculateCrossPlatformScore;
    private calculateConsistencyScore;
    private calculateAuthenticityScore;
    private calculateCompositeScore;
    private cleanText;
    private containsSpamWords;
    private calculateVariance;
    private createEmptyResult;
    private getEligibilityReasons;
    private getStrongestSignal;
    private getRecommendation;
}
