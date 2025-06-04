"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NFTHoldingAnalyzer = void 0;
// src/core/nft-holding.ts
const alchemy_sdk_1 = require("alchemy-sdk");
class NFTHoldingAnalyzer {
    constructor(config) {
        this.config = config;
        this.alchemy = new alchemy_sdk_1.Alchemy({
            apiKey: config.alchemy.apiKey,
            network: alchemy_sdk_1.Network.ETH_MAINNET,
        });
    }
    /**
     * Calculate NFT holding score based on how long user has held Azuki NFTs
     * @param walletAddress - Ethereum wallet address
     * @returns Promise<NFTHoldingResult> with score (0-1) and breakdown
     */
    async getHoldingScore(walletAddress) {
        try {
            const resp = await this.alchemy.nft.getNftsForOwner(walletAddress, {
                contractAddresses: [this.config.contracts.azuki],
            });
            const nfts = resp.ownedNfts || [];
            if (nfts.length === 0) {
                return {
                    score: 0,
                    totalNfts: 0,
                    longTermHeld: 0,
                    holdingRatio: 0,
                    averageHoldingTime: 0,
                    details: {
                        message: "No Azuki NFTs found in wallet",
                        nftBreakdown: [],
                    }
                };
            }
            const now = Date.now();
            const longTermThreshold = this.config.scoring.thresholds.longTermHolding;
            // Analyze each NFT's holding duration
            const nftAnalysis = nfts.map((nft) => {
                const acquiredTimestamp = nft.acquiredAt?.blockTimestamp;
                const holdingTime = acquiredTimestamp
                    ? now - new Date(acquiredTimestamp).getTime()
                    : 0;
                return {
                    tokenId: nft.tokenId,
                    holdingTime,
                    isLongTerm: holdingTime >= longTermThreshold,
                    acquiredAt: acquiredTimestamp,
                };
            });
            const longTermHeld = nftAnalysis.filter(nft => nft.isLongTerm).length;
            const holdingRatio = longTermHeld / nfts.length;
            // Calculate average holding time
            const totalHoldingTime = nftAnalysis.reduce((sum, nft) => sum + nft.holdingTime, 0);
            const averageHoldingTime = totalHoldingTime / nfts.length;
            // Score calculation with bonuses for longer holding
            let score = holdingRatio;
            // Bonus for exceptional holding (2+ years)
            const exceptionalThreshold = longTermThreshold * 2;
            const exceptionalCount = nftAnalysis.filter(nft => nft.holdingTime >= exceptionalThreshold).length;
            if (exceptionalCount > 0) {
                score += (exceptionalCount / nfts.length) * 0.2; // 20% bonus
            }
            // Cap score at 1.0
            score = Math.min(1.0, score);
            return {
                score,
                totalNfts: nfts.length,
                longTermHeld,
                holdingRatio,
                averageHoldingTime,
                details: {
                    message: `Analyzed ${nfts.length} Azuki NFTs`,
                    nftBreakdown: nftAnalysis,
                    exceptionalHolders: exceptionalCount,
                }
            };
        }
        catch (error) {
            console.error("Error analyzing NFT holdings:", error);
            throw new Error(`Failed to analyze NFT holdings: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get detailed holding statistics for a wallet
     */
    async getDetailedHoldingStats(walletAddress) {
        const result = await this.getHoldingScore(walletAddress);
        return {
            ...result,
            insights: {
                isWhale: result.totalNfts >= 10,
                isDiamond: result.holdingRatio >= 0.8,
                isNewbie: result.averageHoldingTime < (30 * 24 * 60 * 60 * 1000), // < 30 days
                recommendation: this.getHoldingRecommendation(result),
            }
        };
    }
    getHoldingRecommendation(result) {
        if (result.score >= 0.8)
            return "Excellent long-term commitment to Azuki";
        if (result.score >= 0.6)
            return "Good holding pattern, consider increasing long-term positions";
        if (result.score >= 0.3)
            return "Moderate holding, focus on long-term accumulation";
        return "Consider building long-term Azuki positions for better reputation";
    }
}
exports.NFTHoldingAnalyzer = NFTHoldingAnalyzer;
