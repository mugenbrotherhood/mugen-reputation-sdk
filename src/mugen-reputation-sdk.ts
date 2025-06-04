// src/mugen-reputation-sdk.ts
import { MugenConfig, defaultConfig, validateConfig } from "./config";
import { NFTHoldingAnalyzer } from "./core/nft-holding";
import { SentimentAnalyzer } from "./core/sentiment-analyzer";
import { GuardianVotingAnalyzer } from "./core/guardian-voting";
import { ReputationScore, SentimentResult, NFTHoldingResult, GuardianVotingResult } from "./types";

export class MugenReputationSDK {
  private config: MugenConfig;
  private nftAnalyzer: NFTHoldingAnalyzer;
  private sentimentAnalyzer: SentimentAnalyzer;
  private guardianAnalyzer: GuardianVotingAnalyzer;

  constructor(customConfig: Partial<MugenConfig> = {}) {
    // Merge custom config with defaults
    this.config = this.mergeConfig(defaultConfig, customConfig);
    
    // Validate configuration
    validateConfig(this.config);
    
    // Initialize analyzers
    this.nftAnalyzer = new NFTHoldingAnalyzer(this.config);
    this.sentimentAnalyzer = new SentimentAnalyzer(this.config);
    this.guardianAnalyzer = new GuardianVotingAnalyzer(this.config);
  }

  /**
   * Calculate comprehensive reputation score for a user
   * @param userId - Unique user identifier
   * @param walletAddress - Optional Ethereum wallet address
   * @param twitterUsername - Optional Twitter username (without @)
   * @returns Promise<ReputationScore> with detailed breakdown
   */
  async calculateReputation(
    userId: string,
    walletAddress?: string,
    twitterUsername?: string
  ): Promise<ReputationScore> {
    console.log(`Starting reputation analysis for user: ${userId}`);
    
    try {
      // Run all analyses in parallel for better performance
      const [sentimentResult, holdingResult, votingResult] = await Promise.allSettled([
        twitterUsername 
          ? this.sentimentAnalyzer.analyzeSentiment(twitterUsername)
          : Promise.resolve(this.createEmptySentimentResult()),
        walletAddress 
          ? this.nftAnalyzer.getHoldingScore(walletAddress)
          : Promise.resolve(this.createEmptyNFTResult()),
        this.guardianAnalyzer.getVotingScore(userId),
      ]);

      // Extract scores, handling any failed promises
      const sentimentScore = this.extractScore(sentimentResult, 'sentiment');
      const holdingScore = this.extractScore(holdingResult, 'holding');
      const votingScore = this.extractScore(votingResult, 'voting');

      // Calculate weighted composite score
      const weights = this.config.scoring.weights;
      const overallScore = 
        sentimentScore * weights.sentiment +
        holdingScore * weights.timeHeld +
        votingScore * weights.guardianVoting;

      // Determine eligibility
      const threshold = this.config.scoring.thresholds.eligibility;
      const isEligible = overallScore >= threshold;
      const eligibilityReasons = this.generateEligibilityReasons(
        sentimentScore, 
        holdingScore, 
        votingScore, 
        threshold
      );

      const reputationScore: ReputationScore = {
        overall: Math.round(overallScore * 1000) / 1000, // Round to 3 decimal places
        components: {
          sentiment: Math.round(sentimentScore * 1000) / 1000,
          timeHeld: Math.round(holdingScore * 1000) / 1000,
          guardianVoting: Math.round(votingScore * 1000) / 1000,
        },
        eligibility: {
          isEligible,
          threshold,
          reasons: eligibilityReasons,
        },
        metadata: {
          analysisDate: new Date().toISOString(),
          userId,
          walletAddress,
          twitterUsername,
        },
      };

      console.log(`Reputation analysis completed for ${userId}. Score: ${overallScore}`);
      return reputationScore;

    } catch (error) {
      console.error(`Error calculating reputation for ${userId}:`, error);
      throw new Error(`Failed to calculate reputation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get only Twitter sentiment analysis
   */
  async getSentimentOnly(
    username: string,
    options?: { tweetCount?: number; threshold?: number }
  ): Promise<SentimentResult> {
    return this.sentimentAnalyzer.analyzeSentiment(username, options);
  }

  /**
   * Get only NFT holding analysis
   */
  async getHoldingOnly(walletAddress: string): Promise<NFTHoldingResult> {
    return this.nftAnalyzer.getHoldingScore(walletAddress);
  }

  /**
   * Get only guardian voting analysis
   */
  async getVotingOnly(userId: string): Promise<GuardianVotingResult> {
    return this.guardianAnalyzer.getVotingScore(userId);
  }

  /**
   * Get detailed holding statistics
   */
  async getDetailedHoldingStats(walletAddress: string) {
    return this.nftAnalyzer.getDetailedHoldingStats(walletAddress);
  }

  /**
   * Batch analyze multiple users
   */
  async batchAnalyze(
    users: Array<{
      userId: string;
      walletAddress?: string;
      twitterUsername?: string;
    }>
  ): Promise<ReputationScore[]> {
    console.log(`Starting batch analysis for ${users.length} users`);
    
    const results = await Promise.allSettled(
      users.map(user => 
        this.calculateReputation(user.userId, user.walletAddress, user.twitterUsername)
      )
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Failed to analyze user ${users[index].userId}:`, result.reason);
        // Return a default failed score
        return this.createFailedReputationScore(users[index].userId, result.reason.message);
      }
    });
  }

  /**
   * Get current configuration
   */
  getConfig(): MugenConfig {
    return { ...this.config }; // Return a copy to prevent external modification
  }

  /**
   * Update configuration (creates new analyzer instances)
   */
  updateConfig(newConfig: Partial<MugenConfig>): void {
    this.config = this.mergeConfig(this.config, newConfig);
    validateConfig(this.config);
    
    // Reinitialize analyzers with new config
    this.nftAnalyzer = new NFTHoldingAnalyzer(this.config);
    this.sentimentAnalyzer = new SentimentAnalyzer(this.config);
    this.guardianAnalyzer = new GuardianVotingAnalyzer(this.config);
  }

  // Private helper methods
  private mergeConfig(base: MugenConfig, override: Partial<MugenConfig>): MugenConfig {
    return {
      alchemy: { ...base.alchemy, ...override.alchemy },
      twitter: { ...base.twitter, ...override.twitter },
      contracts: { ...base.contracts, ...override.contracts },
      scoring: {
        weights: { ...base.scoring.weights, ...override.scoring?.weights },
        thresholds: { ...base.scoring.thresholds, ...override.scoring?.thresholds },
      },
    };
  }

  private extractScore(result: PromiseSettledResult<any>, type: string): number {
    if (result.status === 'fulfilled') {
      return result.value?.score || 0;
    } else {
      console.warn(`${type} analysis failed:`, result.reason);
      return 0;
    }
  }

  private generateEligibilityReasons(
    sentimentScore: number,
    holdingScore: number,
    votingScore: number,
    threshold: number
  ): string[] {
    const reasons: string[] = [];
    const weights = this.config.scoring.weights;
    
    if (sentimentScore < 0.4) {
      reasons.push("Twitter sentiment score below threshold");
    }
    if (holdingScore < 0.3) {
      reasons.push("Insufficient long-term NFT holding");
    }
    if (votingScore < 0.2) {
      reasons.push("Limited governance participation");
    }
    
    const overallScore = sentimentScore * weights.sentiment + 
                        holdingScore * weights.timeHeld + 
                        votingScore * weights.guardianVoting;
    
    if (overallScore < threshold) {
      reasons.push(`Overall score ${overallScore.toFixed(3)} below threshold ${threshold}`);
    }
    
    return reasons;
  }

  private createEmptySentimentResult(): SentimentResult {
    return {
      score: 0,
      isEligible: false,
      breakdown: {
        textSentiment: 0,
        accountAge: 0,
        engagement: 0,
        crossPlatform: 0,
        consistency: 0,
        authenticity: 0,
      },
      metadata: {
        totalTweets: 0,
        relevantTweets: 0,
        analysisDate: new Date().toISOString(),
        threshold: this.config.scoring.thresholds.eligibility,
        eligibilityReasons: ["No Twitter username provided"],
      },
      insights: {
        strongestSignal: "none",
        recommendation: "Provide Twitter username for sentiment analysis",
      }
    };
  }

  private createEmptyNFTResult(): NFTHoldingResult {
    return {
      score: 0,
      totalNfts: 0,
      longTermHeld: 0,
      holdingRatio: 0,
      averageHoldingTime: 0,
      details: {
        message: "No wallet address provided",
        nftBreakdown: [],
      }
    };
  }

  private createFailedReputationScore(userId: string, errorMessage: string): ReputationScore {
    return {
      overall: 0,
      components: {
        sentiment: 0,
        timeHeld: 0,
        guardianVoting: 0,
      },
      eligibility: {
        isEligible: false,
        threshold: this.config.scoring.thresholds.eligibility,
        reasons: [`Analysis failed: ${errorMessage}`],
      },
      metadata: {
        analysisDate: new Date().toISOString(),
        userId,
      },
    };
  }
}