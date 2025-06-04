"use strict";
// src/sentiment.ts
// Comprehensive sentiment and trust scoring for Mugen the Brotherhood
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSentimentScore = getSentimentScore;
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
//––– Helper placeholders for extended signals –––––––––––––––––––––––––––––
async function computeTopicBreadth(userId) {
    // TODO: page through older tweets and count mentions of "anime", "NFT", "Azuki"
    // Return a normalized score [0..1]
    return 0;
}
async function checkDiscordActivity(username) {
    // TODO: query your Discord/Telegram database or API
    return false;
}
async function checkOnChainQuizCompletion(userId) {
    // TODO: check on-chain or database for micro-quest/SBT completion
    return false;
}
async function checkGuardianEndorsement(userId) {
    // TODO: scan for replies/retweets by Guardian handles; return bonus [0..1]
    return 0;
}
async function computeMutualFollowers(userId, credibleHandles) {
    // TODO: calculate fraction of mutual follows with credible Mugen accounts
    return 0;
}
function containsSpamWords(text) {
    // TODO: simple spam/profanity filter
    return false;
}
//––– Fetch up to `count` tweets from a user –––––––––––––––––––––––––––––––
async function fetchTweets(userId, count = 50) {
    var _a;
    // Call Twitter API
    const timeline = await twitter.v2.userTimeline(userId, {
        max_results: count,
        "tweet.fields": ["text", "created_at", "public_metrics", "referenced_tweets"],
    });
    const tweets = ((_a = timeline.data) === null || _a === void 0 ? void 0 : _a.data) || [];
    // Filter out any tweets missing required fields
    const validTweets = [];
    for (const t of tweets) {
        if (t.text && t.created_at && t.public_metrics) {
            // Determine if this tweet is a reply to another tweet
            const isReply = Array.isArray(t.referenced_tweets) && t.referenced_tweets.some(rt => rt.type === "replied_to");
            validTweets.push({
                text: t.text,
                created_at: t.created_at,
                public_metrics: {
                    retweet_count: t.public_metrics.retweet_count,
                    like_count: t.public_metrics.like_count,
                },
                isReply,
            });
        }
    }
    return validTweets;
}
/**
 * getSentimentScore()
 * Combines text sentiment with multiple trust signals into a composite score [–1..1].
 * Returns { score, isEligible } based on threshold.
 */
async function getSentimentScore(username, count = 50, threshold = 0.6) {
    var _a;
    // 1) Resolve user ID and fetch user profile
    const user = await twitter.v2.userByUsername(username);
    if (!((_a = user.data) === null || _a === void 0 ? void 0 : _a.id))
        throw new Error("User not found");
    const userId = user.data.id;
    // 2) Fetch recent tweets
    const rawTweets = await fetchTweets(userId, count);
    // 3) Filter tweets by keywords
    const filteredTweets = rawTweets
        .map(t => ({ ...t, clean_text: cleanText(t.text) }))
        .filter(t => t.clean_text.includes("azuki") || t.clean_text.includes("anime") || t.clean_text.includes("mugen"));
    // 4) Text‐based Sentiment Score
    let textSentimentAvg = 0;
    if (filteredTweets.length) {
        const rawScores = filteredTweets.map(t => sentiment.analyze(t.clean_text).score);
        const normScores = rawScores.map(s => Math.max(-1, Math.min(1, s / 5)));
        textSentimentAvg = normScores.reduce((a, b) => a + b, 0) / normScores.length;
    }
    // 5) Account Longevity & Diversity
    const createdAtStr = user.data.created_at;
    const accountAgeDays = (Date.now() - new Date(createdAtStr).getTime()) / (1000 * 60 * 60 * 24);
    // Score ramps from 0 at 30 days to 1 at 365 days
    const accountAgeScore = Math.min(1, Math.max(0, (accountAgeDays - 30) / (365 - 30)));
    // Topic breadth (older history)
    const topicBreadthScore = await computeTopicBreadth(userId);
    // 6) Interaction Quality Filters
    // (a) Thread depth: use isReply flag
    const threadTweetsCount = filteredTweets.filter(t => t.isReply).length;
    const threadDepthScore = filteredTweets.length
        ? Math.min(1, threadTweetsCount / filteredTweets.length)
        : 0;
    // (b) Retweet ratio penalty: if filtered tweet text starts with "rt "
    const retweetCount = filteredTweets.filter(t => t.text.toLowerCase().startsWith("rt ")).length;
    const retweetRatio = filteredTweets.length ? retweetCount / filteredTweets.length : 0;
    const retweetRatioPenalty = Math.min(1, retweetRatio);
    // 7) Cross-Platform Signals
    const discordActive = (await checkDiscordActivity(username)) ? 1 : 0;
    const onChainQuizScore = (await checkOnChainQuizCompletion(userId)) ? 1 : 0;
    // 8) Reputation & Endorsements
    const guardianEndorsementBonus = await checkGuardianEndorsement(userId);
    const credibleHandlesList = []; // TODO: populate with known Mugen/SBT holder IDs
    const mutualFollowerScore = await computeMutualFollowers(userId, credibleHandlesList);
    // 9) Behavioral Anomalies & Anti-Spam
    const spamScorePenalty = filteredTweets.reduce((penalty, t) => {
        return penalty + (containsSpamWords(t.text) ? 1 : 0);
    }, 0) / (filteredTweets.length || 1);
    const tweetsLastHour = rawTweets.filter(t => {
        return new Date(t.created_at).getTime() > Date.now() - 60 * 60 * 1000;
    }).length;
    const burstTweetPenalty = tweetsLastHour > 50 ? 1 : 0;
    // 10) Sentiment Momentum & Persistence
    const distinctDays = new Set(rawTweets.map(t => new Date(t.created_at).toDateString())).size;
    const sustainedEngagementBonus = distinctDays >= 3 ? 1 : 0;
    const resilienceBonus = rawTweets.some(t => /market downturn|dip|bear/.test(t.text.toLowerCase()) &&
        /refine|improve|quest/.test(t.text.toLowerCase()))
        ? 1
        : 0;
    // 11) Composite Score (weights illustrative)
    const compositeScore = textSentimentAvg * 0.25 +
        accountAgeScore * 0.10 +
        topicBreadthScore * 0.10 +
        threadDepthScore * 0.10 -
        retweetRatioPenalty * 0.10 +
        discordActive * 0.05 +
        onChainQuizScore * 0.05 +
        guardianEndorsementBonus * 0.05 +
        mutualFollowerScore * 0.10 -
        spamScorePenalty * 0.10 -
        burstTweetPenalty * 0.10 +
        sustainedEngagementBonus * 0.10 +
        resilienceBonus * 0.10;
    // 12) Eligibility Check
    return { score: compositeScore, isEligible: compositeScore >= threshold };
}
