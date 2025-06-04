export interface MugenConfig {
    alchemy: {
        apiKey: string;
        network: string;
    };
    twitter: {
        bearerToken: string;
    };
    contracts: {
        azuki: string;
    };
    scoring: {
        weights: {
            sentiment: number;
            timeHeld: number;
            guardianVoting: number;
        };
        thresholds: {
            eligibility: number;
            longTermHolding: number;
        };
    };
}
export declare const defaultConfig: MugenConfig;
export declare function validateConfig(config: MugenConfig): void;
