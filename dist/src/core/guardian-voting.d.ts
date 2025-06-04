import { MugenConfig } from "../config";
import { GuardianVotingResult } from "../types";
export declare class GuardianVotingAnalyzer {
    private config;
    constructor(config: MugenConfig);
    /**
     * Calculate guardian voting score based on governance participation
     * @param userId - User identifier (could be wallet address, Discord ID, etc.)
     * @returns Promise<GuardianVotingResult> with detailed voting analysis
     */
    getVotingScore(userId: string): Promise<GuardianVotingResult>;
    /**
     * Analyze on-chain voting records (Snapshot, on-chain governance)
     */
    private analyzeOnChainVoting;
    /**
     * Analyze Discord governance participation
     */
    private analyzeDiscordParticipation;
    /**
     * Analyze proposal creation and engagement
     */
    private analyzeProposalEngagement;
    /**
     * Analyze endorsements from established guardians
     */
    private analyzeGuardianEndorsements;
    private calculateCompositeVotingScore;
    private determineGovernanceTier;
    private fetchOnChainVotingRecords;
    private fetchDiscordGovernanceActivity;
    private fetchProposalEngagement;
    private fetchGuardianEndorsements;
    private getTotalProposalsCount;
    private calculateVotingConsistency;
    private calculateEarlyVotingBonus;
    private getGuardianWeight;
    private calculateConfidenceLevel;
    private getStrongestContribution;
    private getGovernanceRecommendation;
    private getNextMilestone;
}
