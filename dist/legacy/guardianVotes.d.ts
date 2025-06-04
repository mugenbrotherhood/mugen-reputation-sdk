/**
 * Calculate guardian voting score for a user
 * @param userId - User identifier
 * @returns Promise<number> - Score between 0 and 1
 */
export declare function getGuardianVoteScore(userId: string): Promise<number>;
