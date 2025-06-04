// src/config.ts
import dotenv from "dotenv";
dotenv.config();

export interface MugenConfig {
  alchemy: {
    apiKey: string;
    network: string;
  };
  twitter: {
    bearerToken: string;
  };
  contracts: {
    azuki: string;
  };
  scoring: {
    weights: {
      sentiment: number;
      timeHeld: number;
      guardianVoting: number;
    };
    thresholds: {
      eligibility: number;
      longTermHolding: number; // in milliseconds
    };
  };
}

export const defaultConfig: MugenConfig = {
  alchemy: {
    apiKey: process.env.ALCHEMY_API_KEY!,
    network: "eth-mainnet",
  },
  twitter: {
    bearerToken: process.env.TWITTER_BEARER_TOKEN!,
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
export function validateConfig(config: MugenConfig): void {
  if (!config.alchemy.apiKey) {
    throw new Error("ALCHEMY_API_KEY is required");
  }
  if (!config.twitter.bearerToken) {
    throw new Error("TWITTER_BEARER_TOKEN is required");
  }
}