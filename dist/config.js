"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = void 0;
exports.validateConfig = validateConfig;
// src/config.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.defaultConfig = {
    alchemy: {
        apiKey: process.env.ALCHEMY_API_KEY || "",
        network: "eth-mainnet",
    },
    twitter: {
        bearerToken: process.env.TWITTER_BEARER_TOKEN || "",
    },
    contracts: {
        azuki: "0xed5af388653567af2f388e6224dc7c4b3241c544",
    },
    scoring: {
        weights: {
            sentiment: 0.3,
            timeHeld: 0.5,
            guardianVoting: 0.2,
        },
        thresholds: {
            eligibility: 0.6,
            longTermHolding: 365 * 24 * 60 * 60 * 1000, // 1 year in milliseconds
        },
    },
};
// Validation function to ensure required env vars are present
function validateConfig(config) {
    if (!config.alchemy.apiKey) {
        throw new Error("ALCHEMY_API_KEY is required");
    }
    if (!config.twitter.bearerToken) {
        throw new Error("TWITTER_BEARER_TOKEN is required");
    }
}
