// src/test-new-sdk.ts
import dotenv from "dotenv";
dotenv.config();

import { MugenReputationSDK, createMugenSDK, calculateQuickReputation } from "./index";

async function testSDK() {
  console.log("🚀 Testing Mugen Reputation SDK...\n");

  try {
    // Method 1: Create SDK instance
    console.log("1. Creating SDK instance...");
    const sdk = new MugenReputationSDK({
      scoring: {
        weights: {
          sentiment: 0.4,    // Custom weights
          timeHeld: 0.4,
          guardianVoting: 0.2,
        },
        thresholds: {
          eligibility: 0.7,   // Higher threshold
          longTermHolding: 365 * 24 * 60 * 60 * 1000, // 1 year
        },
      },
    });

    // Method 2: Test individual components
    console.log("\n2. Testing individual components...");
    
    // Test wallet holding analysis (replace with a real wallet)
    const testWallet = "0x1234567890123456789012345678901234567890";
    try {
      const holdingResult = await sdk.getHoldingOnly(testWallet);
      console.log("✅ NFT Holding Analysis:", {
        score: holdingResult.score,
        totalNfts: holdingResult.totalNfts,
        message: holdingResult.details.message,
      });
    } catch (error) {
      console.log("⚠️  NFT Holding Analysis failed (expected with test wallet):", error instanceof Error ? error.message : 'Unknown error');
    }

    // Test Twitter sentiment (replace with a real username)
    const testTwitter = "0xexodia";
    try {
      const sentimentResult = await sdk.getSentimentOnly(testTwitter);
      console.log("✅ Sentiment Analysis:", {
        score: sentimentResult.score,
        isEligible: sentimentResult.isEligible,
        recommendation: sentimentResult.insights.recommendation,
      });
    } catch (error) {
      console.log("⚠️  Sentiment Analysis failed:", error instanceof Error ? error.message : 'Unknown error');
    }

    // Test guardian voting
    try {
      const votingResult = await sdk.getVotingOnly("test-user-123");
      console.log("✅ Guardian Voting Analysis:", {
        score: votingResult.score,
        tier: votingResult.tier,
        recommendation: votingResult.insights.recommendation,
      });
    } catch (error) {
      console.log("⚠️  Guardian Voting Analysis failed:", error instanceof Error ? error.message : 'Unknown error');
    }

    // Method 3: Test full reputation calculation
    console.log("\n3. Testing full reputation calculation...");
    try {
      const reputation = await sdk.calculateReputation(
        "test-user-456",
        testWallet,
        testTwitter
      );
      
      console.log("✅ Full Reputation Analysis:", {
        overall: reputation.overall,
        components: reputation.components,
        isEligible: reputation.eligibility.isEligible,
        reasons: reputation.eligibility.reasons,
      });
    } catch (error) {
      console.log("⚠️  Full reputation analysis had issues:", error instanceof Error ? error.message : 'Unknown error');
    }

    // Method 4: Test convenience functions
    console.log("\n4. Testing convenience functions...");
    try {
      const quickResult = await calculateQuickReputation("quick-test-user");
      console.log("✅ Quick Reputation:", quickResult.overall);
    } catch (error) {
      console.log("⚠️  Quick reputation failed:", error instanceof Error ? error.message : 'Unknown error');
    }

    // Method 5: Test batch analysis
    console.log("\n5. Testing batch analysis...");
    try {
      const batchResults = await sdk.batchAnalyze([
        { userId: "user1", twitterUsername: testTwitter },
        { userId: "user2", walletAddress: testWallet },
        { userId: "user3" }, // Neither wallet nor twitter
      ]);
      
      console.log("✅ Batch Analysis completed:", batchResults.map(r => ({
        userId: r.metadata.userId,
        score: r.overall,
        eligible: r.eligibility.isEligible,
      })));
    } catch (error) {
      console.log("⚠️  Batch analysis failed:", error instanceof Error ? error.message : 'Unknown error');
    }

    console.log("\n🎉 SDK test completed!");

  } catch (error) {
    console.error("❌ SDK test failed:", error instanceof Error ? error.message : 'Unknown error');
  }
}

// Run the test
if (require.main === module) {
  testSDK();
}