/**
 * getSentimentScore()
 * Combines text sentiment with multiple trust signals into a composite score [–1..1].
 * Returns { score, isEligible } based on threshold.
 */
export declare function getSentimentScore(username: string, count?: number, threshold?: number): Promise<{
    score: number;
    isEligible: boolean;
}>;
