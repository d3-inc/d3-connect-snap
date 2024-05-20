import type { OnNameLookupHandler, OnRpcRequestHandler } from '@metamask/snaps-sdk';
import { panel, text } from '@metamask/snaps-sdk';
import { D3Connect } from '@d3-inc/d3connect'

type ChainMetadata = {
  name: string;
  chain: string;
  icon: string;
  rpc: string[],
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
  }[]
}

const d3Connect = new D3Connect({
  dns: {
    forwarderDomain: 'vana',
    reverseLookupBaseDomain: 'web3-addr.vana',
    dnssecVerification: true,
  }
});

async function fetchChainInformation(chainId: string) {
  const chainMatch = chainId.match(/^eip155:(?<chainId>\d+)$/);
  const id = chainMatch?.groups?.chainId;
  if (!id) { return }
  /* TODO: Cache results */
  const response = await fetch('https://chainid.network/chains.json');
  const data: ChainMetadata[] = await response.json();
  return data.find(chain => chain.chainId === parseInt(id))
}

export const onNameLookup: OnNameLookupHandler = async (request) => {
  if (request.domain) {
    const chainInfo = await fetchChainInformation(request.chainId);

    if (!chainInfo) {
      console.log(`Can't load chain info for ${request.chainId}`)
      return null;
    }

    const resolvedAddress = await d3Connect.resolve(request.domain, chainInfo?.nativeCurrency?.symbol);

    if (resolvedAddress) {
      return {
        resolvedAddresses: [{resolvedAddress, protocol: 'D3 Connect'}]
      };
    }
  }

  if (request.address) {
    const resolvedDomain = await d3Connect.reverseResolve(request.address, 'ETH')
    if (resolvedDomain) {
    return {
        resolvedDomains: [{resolvedDomain, protocol: 'D3 Connect'}]
      }
    }
  }

  return null;
}
