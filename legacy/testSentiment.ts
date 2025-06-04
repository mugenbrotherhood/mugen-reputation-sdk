import dotenv from "dotenv";
dotenv.config();

import { getSentimentScore } from "../legacy/sentiment";
//                                ^ no “src/” prefix, because we’re already in src/

async function main() {
  const twitterUserId = "0xexodia";
  const score = await getSentimentScore(twitterUserId);
  console.log("Sentiment score:", score);
}
main();
