"use strict";
// src/index.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SDK_VERSION = exports.GuardianVotingAnalyzer = exports.SentimentAnalyzer = exports.NFTHoldingAnalyzer = exports.validateConfig = exports.defaultConfig = exports.MugenReputationSDK = void 0;
exports.calculateQuickReputation = calculateQuickReputation;
exports.createMugenSDK = createMugenSDK;
exports.testSDK = testSDK;
// Main SDK export
var mugen_reputation_sdk_1 = require("./mugen-reputation-sdk");
Object.defineProperty(exports, "MugenReputationSDK", { enumerable: true, get: function () { return mugen_reputation_sdk_1.MugenReputationSDK; } });
// Configuration exports
var config_1 = require("./config");
Object.defineProperty(exports, "defaultConfig", { enumerable: true, get: function () { return config_1.defaultConfig; } });
Object.defineProperty(exports, "validateConfig", { enumerable: true, get: function () { return config_1.validateConfig; } });
// Type exports
__exportStar(require("./types"), exports);
// Core module exports (for advanced users who want individual components)
var nft_holding_1 = require("./core/nft-holding");
Object.defineProperty(exports, "NFTHoldingAnalyzer", { enumerable: true, get: function () { return nft_holding_1.NFTHoldingAnalyzer; } });
var sentiment_analyzer_1 = require("./core/sentiment-analyzer");
Object.defineProperty(exports, "SentimentAnalyzer", { enumerable: true, get: function () { return sentiment_analyzer_1.SentimentAnalyzer; } });
var guardian_voting_1 = require("./core/guardian-voting");
Object.defineProperty(exports, "GuardianVotingAnalyzer", { enumerable: true, get: function () { return guardian_voting_1.GuardianVotingAnalyzer; } });
// Simple version info
exports.SDK_VERSION = "1.0.0";
// Import necessary types for the convenience functions
const mugen_reputation_sdk_2 = require("./mugen-reputation-sdk");
/**
 * Convenience function for quick reputation calculation
 * @param userId - User identifier
 * @param walletAddress - Optional wallet address
 * @param twitterUsername - Optional Twitter username
 * @param customConfig - Optional custom configuration
 */
async function calculateQuickReputation(userId, walletAddress, twitterUsername, customConfig) {
    const sdk = new mugen_reputation_sdk_2.MugenReputationSDK(customConfig);
    return sdk.calculateReputation(userId, walletAddress, twitterUsername);
}
/**
 * Create SDK instance with default configuration
 */
function createMugenSDK(customConfig) {
    return new mugen_reputation_sdk_2.MugenReputationSDK(customConfig);
}
// Simple test function
function testSDK() {
    console.log("Mugen Reputation SDK v1.0.0");
    return "SDK is working!";
}
