export { MugenReputationSDK } from "./mugen-reputation-sdk";
export { MugenConfig, defaultConfig, validateConfig } from "./config";
export * from "./types";
export { NFTHoldingAnalyzer } from "./core/nft-holding";
export { SentimentAnalyzer } from "./core/sentiment-analyzer";
export { GuardianVotingAnalyzer } from "./core/guardian-voting";
export declare const SDK_VERSION = "1.0.0";
import { MugenReputationSDK } from "./mugen-reputation-sdk";
import { MugenConfig } from "./config";
/**
 * Convenience function for quick reputation calculation
 * @param userId - User identifier
 * @param walletAddress - Optional wallet address
 * @param twitterUsername - Optional Twitter username
 * @param customConfig - Optional custom configuration
 */
export declare function calculateQuickReputation(userId: string, walletAddress?: string, twitterUsername?: string, customConfig?: Partial<MugenConfig>): Promise<import("./types").ReputationScore>;
/**
 * Create SDK instance with default configuration
 */
export declare function createMugenSDK(customConfig?: Partial<MugenConfig>): MugenReputationSDK;
export declare function testSDK(): string;
