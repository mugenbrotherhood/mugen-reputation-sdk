"use strict";
// src/sentiment.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTweets = getTweets;
exports.getAzukiSentiment = getAzukiSentiment;
const twitter_api_v2_1 = require("twitter-api-v2");
const sentiment_1 = __importDefault(require("sentiment"));
//––– Load your Twitter tokens from env –––––––––––––––––––––––––––––––––––––
const TWITTER_BEARER = process.env.TWITTER_BEARER_TOKEN;
if (!TWITTER_BEARER) {
    throw new Error("Missing TWITTER_BEARER_TOKEN in env");
}
//––– Instantiate clients –––––––––––––––––––––––––––––––––––––––––––––––––––
const twitter = new twitter_api_v2_1.TwitterApi(TWITTER_BEARER);
const sentiment = new sentiment_1.default();
//––– Helper: clean & normalize text –––––––––––––––––––––––––––––––––––––
function cleanText(text) {
    return text
        .replace(/http\S+/g, "") // strip URLs
        .replace(/[^A-Za-z0-9 ]+/g, "") // strip special chars
        .toLowerCase()
        .trim();
}
//––– Fetch up to `count` tweets from a user –––––––––––––––––––––––––––––––
async function getTweets(username, count = 50) {
    var _a, _b;
    const user = await twitter.v2.userByUsername(username);
    if (!((_a = user.data) === null || _a === void 0 ? void 0 : _a.id))
        throw new Error("User not found");
    const timeline = await twitter.v2.userTimeline(user.data.id, {
        max_results: count,
        "tweet.fields": ["text"],
    });
    // timeline.data.data is Array<{ text: string }>
    return (((_b = timeline.data) === null || _b === void 0 ? void 0 : _b.data) || [])
        .map((t) => cleanText(t.text))
        .filter((t) => t.includes("azuki"));
}
//––– Analyze sentiment of those filtered tweets –––––––––––––––––––––––––––
async function getAzukiSentiment(username, threshold = 0.6) {
    const tweets = await getTweets(username);
    if (tweets.length === 0) {
        return { score: 0, isPositive: false };
    }
    // run `sentiment` on each cleaned tweet
    const scores = tweets.map((t) => sentiment.analyze(t).score);
    // Normalize roughly from [-5,5] to [-1,1]
    const normScores = scores.map((s) => Math.max(-1, Math.min(1, s / 5)));
    const avg = normScores.reduce((a, b) => a + b, 0) / normScores.length;
    return { score: avg, isPositive: avg >= threshold };
}
