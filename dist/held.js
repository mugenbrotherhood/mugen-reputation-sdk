"use strict";
// src/held.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAzukiHeldScore = getAzukiHeldScore;
const alchemy_sdk_1 = require("alchemy-sdk");
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const AZUKI_CONTRACT = "0xed5af388653567af2f388e6224dc7c4b3241c544";
const alchemy = new alchemy_sdk_1.Alchemy({
    apiKey: ALCHEMY_API_KEY,
    network: alchemy_sdk_1.Network.ETH_MAINNET,
});
async function getAzukiHeldScore(wallet) {
    const resp = await alchemy.nft.getNftsForOwner(wallet, {
        contractAddresses: [AZUKI_CONTRACT],
    });
    const nfts = resp.ownedNfts || [];
    if (nfts.length === 0)
        return 0;
    const now = Date.now();
    const yearMs = 365 * 24 * 60 * 60 * 1000;
    const oldCount = nfts.filter((nft) => {
        var _a;
        // Alchemy v3 OwnedNft includes an optional acquiredAt.blockTimestamp
        const ts = (_a = nft.acquiredAt) === null || _a === void 0 ? void 0 : _a.blockTimestamp;
        if (!ts)
            return false;
        const transferTime = new Date(ts).getTime();
        return now - transferTime >= yearMs;
    }).length;
    return oldCount / nfts.length;
}
