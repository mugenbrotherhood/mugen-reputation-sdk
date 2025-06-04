export interface ReputationScore {
    overall: number;
    components: {
        sentiment: number;
        timeHeld: number;
        guardianVoting: number;
    };
    eligibility: {
        isEligible: boolean;
        threshold: number;
        reasons?: string[];
    };
    metadata: {
        analysisDate: string;
        userId: string;
        walletAddress?: string;
        twitterUsername?: string;
    };
}
export interface SentimentResult {
    score: number;
    isEligible: boolean;
    breakdown: {
        textSentiment: number;
        accountAge: number;
        engagement: number;
        crossPlatform: number;
        consistency: number;
        authenticity: number;
    };
    metadata: {
        totalTweets: number;
        relevantTweets: number;
        analysisDate: string;
        threshold: number;
        eligibilityReasons: string[];
    };
    insights: {
        strongestSignal: string;
        recommendation: string;
    };
}
export interface NFTHoldingResult {
    score: number;
    totalNfts: number;
    longTermHeld: number;
    holdingRatio: number;
    averageHoldingTime: number;
    details: {
        message: string;
        nftBreakdown: Array<{
            tokenId: string;
            holdingTime: number;
            isLongTerm: boolean;
            acquiredAt?: string;
        }>;
        exceptionalHolders?: number;
    };
}
export interface GuardianVotingResult {
    score: number;
    isActiveParticipant: boolean;
    tier: "Guardian" | "Active" | "Participant" | "Observer";
    breakdown: {
        onChainVoting: number;
        discordParticipation: number;
        proposalEngagement: number;
        guardianEndorsements: number;
    };
    insights: {
        strongestContribution: string;
        recommendation: string;
        nextMilestone: string;
    };
    metadata: {
        analysisDate: string;
        dataSource: string;
        confidenceLevel: number;
    };
}
export interface TweetAnalysis {
    id: string;
    text: string;
    cleanText: string;
    createdAt: string;
    metrics: {
        like_count: number;
        retweet_count: number;
    };
    isReply: boolean;
    isRetweet: boolean;
}
export interface VotingRecord {
    proposalId: string;
    vote: "yes" | "no" | "abstain";
    timestamp: string;
    votingPower: number;
}
export interface GovernanceParticipation {
    governanceMessages: number;
    proposalReplies: number;
    helpfulActions: number;
    activeDays: number;
}
export interface ProposalEngagement {
    proposalsCreated: number;
    meaningfulComments: number;
    successfulProposals: number;
}
export interface GuardianEndorsement {
    guardianId: string;
    strength: number;
    timestamp: string;
}
