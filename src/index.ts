// src/index.ts

// Main SDK export
export { MugenReputationSDK } from "./mugen-reputation-sdk";

// Configuration exports
export { MugenConfig, defaultConfig, validateConfig } from "./config";

// Type exports
export * from "./types";

// Core module exports (for advanced users who want individual components)
export { NFTHoldingAnalyzer } from "./core/nft-holding";
export { SentimentAnalyzer } from "./core/sentiment-analyzer";
export { GuardianVotingAnalyzer } from "./core/guardian-voting";

// Simple version info
export const SDK_VERSION = "1.0.0";

// Import necessary types for the convenience functions
import { MugenReputationSDK } from "./mugen-reputation-sdk";
import { MugenConfig } from "./config";

/**
 * Convenience function for quick reputation calculation
 * @param userId - User identifier
 * @param walletAddress - Optional wallet address
 * @param twitterUsername - Optional Twitter username
 * @param customConfig - Optional custom configuration
 */
export async function calculateQuickReputation(
  userId: string,
  walletAddress?: string,
  twitterUsername?: string,
  customConfig?: Partial<MugenConfig>
) {
  const sdk = new MugenReputationSDK(customConfig);
  return sdk.calculateReputation(userId, walletAddress, twitterUsername);
}

/**
 * Create SDK instance with default configuration
 */
export function createMugenSDK(customConfig?: Partial<MugenConfig>) {
  return new MugenReputationSDK(customConfig);
}

// Simple test function
export function testSDK() {
  console.log("Mugen Reputation SDK v1.0.0");
  return "SDK is working!";
}