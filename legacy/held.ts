// src/held.ts

import { Alchemy, Network } from "alchemy-sdk";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY!;
const AZUKI_CONTRACT = "0xed5af388653567af2f388e6224dc7c4b3241c544";

const alchemy = new Alchemy({
  apiKey: ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
});

export async function getAzukiHeldScore(wallet: string): Promise<number> {
  const resp = await alchemy.nft.getNftsForOwner(wallet, {
    contractAddresses: [AZUKI_CONTRACT],
  });
  const nfts = resp.ownedNfts || [];
  if (nfts.length === 0) return 0;

  const now = Date.now();
  const yearMs = 365 * 24 * 60 * 60 * 1000;

  const oldCount = nfts.filter((nft) => {
    // Alchemy v3 OwnedNft includes an optional acquiredAt.blockTimestamp
    const ts = nft.acquiredAt?.blockTimestamp;
    if (!ts) return false;
    const transferTime = new Date(ts).getTime();
    return now - transferTime >= yearMs;
  }).length;

  return oldCount / nfts.length;
}
