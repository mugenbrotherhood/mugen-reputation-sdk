// src/core/sentiment-analyzer.ts
import { TwitterApi } from "twitter-api-v2";
import Sentiment from "sentiment";
import { MugenConfig } from "../config";
import { SentimentResult, TweetAnalysis } from "../types";

export class SentimentAnalyzer {
  private twitter: TwitterApi;
  private sentiment: Sentiment;
  private config: MugenConfig;

  constructor(config: MugenConfig) {
    this.config = config;
    this.twitter = new TwitterApi(config.twitter.bearerToken);
    this.sentiment = new Sentiment();
  }

  /**
   * Analyze Twitter sentiment for a user with comprehensive scoring
   * @param username - Twitter username (without @)
   * @param options - Analysis options
   * @returns Promise<SentimentResult> with detailed breakdown
   */
  async analyzeSentiment(
    username: string,
    options: { 
      tweetCount?: number; 
      threshold?: number;
      includeReplies?: boolean;
    } = {}
  ): Promise<SentimentResult> {
    const { 
      tweetCount = 50, 
      threshold = 0.6,
      includeReplies = true 
    } = options;

    try {
      // 1. Get user profile
      const user = await this.twitter.v2.userByUsername(username);
      if (!user.data?.id) {
        throw new Error(`User ${username} not found`);
      }

      const userId = user.data.id;
      const userProfile = user.data;

      // 2. Fetch recent tweets
      const tweets = await this.fetchUserTweets(userId, tweetCount, includeReplies);
      
      // 3. Filter for relevant content
      const relevantTweets = this.filterRelevantTweets(tweets);
      
      if (relevantTweets.length === 0) {
        return this.createEmptyResult("No relevant tweets found");
      }

      // 4. Calculate all scoring components
      const textSentiment = this.calculateTextSentiment(relevantTweets);
      const accountAge = this.calculateAccountAgeScore(userProfile.created_at!);
      const engagement = this.calculateEngagementScore(relevantTweets);
      const crossPlatform = await this.calculateCrossPlatformScore(userId, username);
      const consistency = this.calculateConsistencyScore(relevantTweets);
      const authenticity = this.calculateAuthenticityScore(relevantTweets, tweets);

      // 5. Calculate composite score
      const compositeScore = this.calculateCompositeScore({
        textSentiment,
        accountAge,
        engagement,
        crossPlatform,
        consistency,
        authenticity,
      });

      // 6. Determine eligibility
      const isEligible = compositeScore >= threshold;
      const eligibilityReasons = this.getEligibilityReasons(
        { textSentiment, accountAge, engagement, crossPlatform, consistency, authenticity },
        threshold
      );

      return {
        score: compositeScore,
        isEligible,
        breakdown: {
          textSentiment,
          accountAge,
          engagement,
          crossPlatform,
          consistency,
          authenticity,
        },
        metadata: {
          totalTweets: tweets.length,
          relevantTweets: relevantTweets.length,
          analysisDate: new Date().toISOString(),
          threshold,
          eligibilityReasons,
        },
        insights: {
          strongestSignal: this.getStrongestSignal({ textSentiment, accountAge, engagement, crossPlatform, consistency, authenticity }),
          recommendation: this.getRecommendation(compositeScore, { textSentiment, accountAge, engagement, crossPlatform, consistency, authenticity }),
        }
      };

    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      throw new Error(`Failed to analyze sentiment for ${username}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async fetchUserTweets(userId: string, count: number, includeReplies: boolean) {
    const timeline = await this.twitter.v2.userTimeline(userId, {
      max_results: Math.min(count, 100), // API limit
      "tweet.fields": ["text", "created_at", "public_metrics", "referenced_tweets", "context_annotations"],
      exclude: includeReplies ? undefined : ["replies"],
    });

    return timeline.data?.data || [];
  }

  private filterRelevantTweets(tweets: any[]): TweetAnalysis[] {
    return tweets
      .map(tweet => ({
        id: tweet.id,
        text: tweet.text,
        cleanText: this.cleanText(tweet.text),
        createdAt: tweet.created_at,
        metrics: tweet.public_metrics,
        isReply: tweet.referenced_tweets?.some((rt: any) => rt.type === "replied_to") || false,
        isRetweet: tweet.text.toLowerCase().startsWith("rt "),
      }))
      .filter(tweet => 
        tweet.cleanText.includes("azuki") || 
        tweet.cleanText.includes("anime") || 
        tweet.cleanText.includes("mugen") ||
        tweet.cleanText.includes("nft")
      );
  }

  private calculateTextSentiment(tweets: TweetAnalysis[]): number {
    if (tweets.length === 0) return 0;

    const sentimentScores = tweets.map(tweet => {
      const analysis = this.sentiment.analyze(tweet.cleanText);
      // Normalize to -1 to 1 range
      return Math.max(-1, Math.min(1, analysis.score / 5));
    });

    const avgSentiment = sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length;
    
    // Convert to 0-1 scale
    return (avgSentiment + 1) / 2;
  }

  private calculateAccountAgeScore(createdAt: string): number {
    const accountAgeDays = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    // Score ramps from 0 at 30 days to 1 at 365 days
    return Math.min(1, Math.max(0, (accountAgeDays - 30) / (365 - 30)));
  }

  private calculateEngagementScore(tweets: TweetAnalysis[]): number {
    if (tweets.length === 0) return 0;

    // Calculate thread participation
    const threadParticipation = tweets.filter(t => t.isReply).length / tweets.length;
    
    // Calculate retweet ratio (penalty for too many retweets)
    const retweetRatio = tweets.filter(t => t.isRetweet).length / tweets.length;
    const retweetPenalty = Math.min(0.5, retweetRatio);

    // Calculate average engagement per tweet
    const avgLikes = tweets.reduce((sum, t) => sum + (t.metrics?.like_count || 0), 0) / tweets.length;
    const avgRetweets = tweets.reduce((sum, t) => sum + (t.metrics?.retweet_count || 0), 0) / tweets.length;
    
    // Normalize engagement (assuming good engagement is 10+ likes, 2+ retweets)
    const engagementScore = Math.min(1, (avgLikes / 10 + avgRetweets / 2) / 2);

    return Math.max(0, threadParticipation * 0.4 + engagementScore * 0.6 - retweetPenalty);
  }

  private async calculateCrossPlatformScore(userId: string, username: string): Promise<number> {
    // Placeholder for cross-platform analysis
    // TODO: Implement Discord, Telegram, GitHub checks
    let score = 0;

    // Check for Discord mentions in bio or tweets
    // Check for consistent username across platforms
    // Check for verified external links

    return score; // 0-1 scale
  }

  private calculateConsistencyScore(tweets: TweetAnalysis[]): number {
    if (tweets.length < 3) return 0;

    // Check posting consistency over time
    const dates = tweets.map(t => new Date(t.createdAt).toDateString());
    const uniqueDays = new Set(dates).size;
    const daySpread = tweets.length > 0 ? uniqueDays / Math.min(7, tweets.length) : 0;

    // Check sentiment consistency
    const sentiments = tweets.map(t => this.sentiment.analyze(t.cleanText).score);
    const sentimentVariance = this.calculateVariance(sentiments);
    const consistencyScore = Math.max(0, 1 - sentimentVariance / 10); // Normalize variance

    return (daySpread * 0.3 + consistencyScore * 0.7);
  }

  private calculateAuthenticityScore(relevantTweets: TweetAnalysis[], allTweets: any[]): number {
    let score = 1.0;

    // Penalty for spam patterns
    const spamIndicators = relevantTweets.filter(t => this.containsSpamWords(t.text)).length;
    score -= (spamIndicators / relevantTweets.length) * 0.3;

    // Penalty for burst tweeting
    const recentHour = Date.now() - (60 * 60 * 1000);
    const burstTweets = allTweets.filter(t => 
      new Date(t.created_at).getTime() > recentHour
    ).length;
    if (burstTweets > 10) score -= 0.2;

    return Math.max(0, score);
  }

  private calculateCompositeScore(scores: Record<string, number>): number {
    const weights = {
      textSentiment: 0.25,
      accountAge: 0.15,
      engagement: 0.20,
      crossPlatform: 0.10,
      consistency: 0.15,
      authenticity: 0.15,
    };

    return Object.entries(weights).reduce((total, [key, weight]) => {
      return total + (scores[key] || 0) * weight;
    }, 0);
  }

  private cleanText(text: string): string {
    return text
      .replace(/http\S+/g, "")
      .replace(/[^A-Za-z0-9 ]+/g, "")
      .toLowerCase()
      .trim();
  }

  private containsSpamWords(text: string): boolean {
    const spamWords = ["pump", "moon", "scam", "rug", "sus", "shill"];
    const lowerText = text.toLowerCase();
    return spamWords.some(word => lowerText.includes(word));
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return squaredDiffs.reduce((sum, sq) => sum + sq, 0) / numbers.length;
  }

  private createEmptyResult(reason: string): SentimentResult {
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
        threshold: 0.6,
        eligibilityReasons: [reason],
      },
      insights: {
        strongestSignal: "none",
        recommendation: reason,
      }
    };
  }

  private getEligibilityReasons(scores: Record<string, number>, threshold: number): string[] {
    const reasons: string[] = [];
    
    if (scores.textSentiment < 0.3) reasons.push("Low positive sentiment in tweets");
    if (scores.accountAge < 0.2) reasons.push("Account too new");
    if (scores.engagement < 0.2) reasons.push("Limited community engagement");
    if (scores.authenticity < 0.5) reasons.push("Authenticity concerns detected");
    
    return reasons;
  }

  private getStrongestSignal(scores: Record<string, number>): string {
    const entries = Object.entries(scores);
    if (entries.length === 0) return "none";
    
    return entries.reduce((best, [key, value]) => 
      value > scores[best[0]] ? [key, value] : best
    )[0];
  }

  private getRecommendation(overallScore: number, scores: Record<string, number>): string {
    if (overallScore >= 0.8) return "Excellent Mugen community member";
    if (overallScore >= 0.6) return "Good community engagement, consider increasing activity";
    if (overallScore >= 0.4) return "Moderate engagement, focus on authentic Azuki content";
    return "Increase genuine community participation and Azuki-focused content";
  }
}