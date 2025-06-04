import { MugenConfig } from "./config";
import { NFTHoldingResult } from "../types";
export declare class NFTHoldingAnalyzer {
    private alchemy;
    private config;
    constructor(config: MugenConfig);
    /**
     * Calculate NFT holding score based on how long user has held Azuki NFTs
     * @param walletAddress - Ethereum wallet address
     * @returns Promise<NFTHoldingResult> with score (0-1) and breakdown
     */
    getHoldingScore(walletAddress: string): Promise<NFTHoldingResult>;
    /**
     * Get detailed holding statistics for a wallet
     */
    getDetailedHoldingStats(walletAddress: string): Promise<any>;
    private getHoldingRecommendation;
}
