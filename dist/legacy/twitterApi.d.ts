export type TweetWithMetrics = {
    id: string;
    text: string;
    created_at: string;
    public_metrics: {
        retweet_count: number;
        like_count: number;
    };
    entities?: {
        urls?: any;
        hashtags?: any;
        mentions?: any;
    };
    threadLength?: number;
    in_reply_to_user_id?: string;
    referenced_tweets?: {
        id: string;
        author_id: string;
    }[];
    author?: {
        id: string;
        username: string;
        created_at: string;
        public_metrics: {
            tweet_count: number;
        };
        entities?: {
            url?: {
                urls: {
                    expanded_url: string;
                }[];
            };
        };
    };
};
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
export declare function fetchTweets(userId: string, opts?: {
    max_results: number;
    tweet_fields: string[];
    expansions: string[];
    start_time?: string;
}): Promise<TweetWithMetrics[]>;
