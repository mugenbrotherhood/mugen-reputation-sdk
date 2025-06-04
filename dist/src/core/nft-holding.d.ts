import { MugenConfig } from "../config";
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
    private getHoldingRecommendation;
}
