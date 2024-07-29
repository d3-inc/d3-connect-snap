import { D3Connect } from '@d3-inc/d3connect';
import type { OnNameLookupHandler } from '@metamask/snaps-sdk';

type SnapConfig = {
  d3Connect?: D3Connect | undefined;
  fetchFullChains: () => Promise<ChainMetadata[]>;
};

const config: SnapConfig = {
  d3Connect: new D3Connect({
    dns: {
      forwarderDomain: 'vana',
      reverseLookupBaseDomain: 'wallet.vana',
      dnssecVerification: true,
    },
  }),
  async fetchFullChains() {
    /* TODO: Cache results */
    const response = await fetch('https://chainid.network/chains.json');
    const data: ChainMetadata[] = await response.json();

    return data;
  },
};

type ChainMetadata = {
  name: string;
  chain: string;
  icon: string;
  rpc: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  infoURL: string;
  shortName: string;
  chainId: number;
  networkId: number;
  explorers: {
    name: string;
    url: string;
    icon: string;
    standard: string;
  }[];
};

/**
 * Fetches chain information from https://chainid.network/chains.json and returns ChainMetadata.
 *
 * @param chainId - Chain id in the format `eip155:<id>`, ie `eip155:1` for Ethereum mainnet.
 * @returns ChainMetadata.
 */
async function fetchChainInformation(
  chainId: string,
): Promise<ChainMetadata | undefined> {
  const chainMatch = chainId.match(/^eip155:(?<chainId>\d+)$/u);
  const id = chainMatch?.groups?.chainId;
  if (!id) {
    return undefined;
  }

  const data = await config.fetchFullChains();
  return data.find((chain) => chain.chainId === parseInt(id, 10));
}

export const onNameLookup: OnNameLookupHandler = async (request) => {
  if (request.domain) {
    const chainInfo = await fetchChainInformation(request.chainId);

    if (!chainInfo) {
      console.log(`Can't load chain info for ${request.chainId}`);
      return null;
    }

    const resolvedAddress = await config.d3Connect?.resolve(
      request.domain,
      chainInfo?.nativeCurrency?.symbol,
    );

    if (resolvedAddress) {
      return {
        resolvedAddresses: [{ resolvedAddress, protocol: 'D3 Connect' }],
      };
    }
  }

  if (request.address) {
    const resolvedDomain = await config.d3Connect?.reverseResolve(
      request.address,
      'ETH',
    );
    if (resolvedDomain) {
      return {
        resolvedDomains: [{ resolvedDomain, protocol: 'D3 Connect' }],
      };
    }
  }

  return null;
};

/**
 * Setup initial config for Snap, used for testing only.
 *
 * @param newConfig - New config to be applied.
 */
export function setup(newConfig: SnapConfig) {
  config.d3Connect = newConfig.d3Connect;
  config.fetchFullChains = newConfig.fetchFullChains;
}
