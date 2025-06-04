"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchTweets = fetchTweets;
// src/twitterApi.ts
const node_fetch_1 = __importDefault(require("node-fetch"));
/**
 * fetchTweets()
 *
 * Fetches up to `opts.max_results` tweets for a given user ID from the Twitter v2 API.
 *
 * @param userId   - Twitter user ID (numeric string)
 * @param opts     - Optional parameters:
 *                     • max_results: number (up to 100)
 *                     • tweet_fields: array of tweet‐field strings (e.g. ['created_at','public_metrics'])
 *                     • expansions: array of expansion strings (e.g. ['referenced_tweets.id.author_id'])
 *                     • start_time: ISO timestamp string (if you want a time‐bounded window)
 *
 * @returns Promise<TweetWithMetrics[]>  – An array of tweet objects matching TweetWithMetrics
 *
 * Throws an Error if the Twitter API returns a non‐200 status.
 */
async function fetchTweets(userId, opts) {
    // Build query parameters
    const params = new URLSearchParams();
    params.append("max_results", (opts?.max_results ?? 20).toString());
    params.append("tweet.fields", (opts?.tweet_fields ?? []).join(","));
    if (opts?.expansions) {
        params.append("expansions", opts.expansions.join(","));
    }
    if (opts?.start_time) {
        params.append("start_time", opts.start_time);
    }
    // Construct the URL
    const url = `https://api.twitter.com/2/users/${userId}/tweets?${params.toString()}`;
    const res = await (0, node_fetch_1.default)(url, {
        headers: {
            Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        },
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Twitter API error ${res.status}: ${text}`);
    }
    const json = await res.json();
    // Return the raw `data` array as TweetWithMetrics[]
    return (json.data || []);
}
