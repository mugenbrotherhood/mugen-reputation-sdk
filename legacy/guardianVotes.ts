// legacy/guardianVotes.ts
// Stub implementation for guardian voting score

/**
 * Calculate guardian voting score for a user
 * @param userId - User identifier
 * @returns Promise<number> - Score between 0 and 1
 */
export async function getGuardianVoteScore(userId: string): Promise<number> {
  // TODO: Implement actual guardian voting logic
  // For now, return a mock score
  console.warn(`getGuardianVoteScore called for ${userId} - returning mock score`);
  return 0.5; // Mock score
} 