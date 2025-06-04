"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/testSentiment.ts
require("./config"); // loads dotenv
const sentiment_1 = require("./sentiment");
(async () => {
    const username = "0xexodia";
    console.log(`\nFetching tweets for @${username}…`);
    const tweets = await (0, sentiment_1.getTweets)(username, 20);
    console.log(`  → Found ${tweets.length} tweets mentioning “azuki”:`);
    tweets.forEach((t, i) => console.log(`    ${i + 1}. ${t}`));
    console.log(`\nAnalyzing sentiment…`);
    const { score, isPositive } = await (0, sentiment_1.getAzukiSentiment)(username);
    console.log(`  • Score: ${score.toFixed(2)}`);
    console.log(`  • Interpretation: ${isPositive ? "👍 Positive" : "👎 Not positive"}\n`);
})().catch((err) => {
    console.error("Error in testSentiment:", err);
    process.exit(1);
});
