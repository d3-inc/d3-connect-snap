import type { D3Connect } from '@d3-inc/d3connect';
import { expect } from '@jest/globals';

import { onNameLookup, setup } from '.';

describe('onNameLookup', () => {
  const d3ConnectMock = {
    resolve: jest.fn(),
    reverseResolve: jest.fn(),
  };
  const testConfig = {
    d3Connect: d3ConnectMock as unknown as D3Connect,
    fetchFullChains: jest.fn().mockResolvedValue([
      {
        chainId: 1,
        nativeCurrency: {
          symbol: 'ETH',
        },
      },
    ]),
  };

  beforeAll(() => {
    setup(testConfig);
  });

  beforeEach(() => {
    d3ConnectMock.resolve.mockClear();
    d3ConnectMock.reverseResolve.mockClear();
  });

  describe('Forward resolution', () => {
    it('should resolve existing domain for existing chain', async () => {
      d3ConnectMock.resolve.mockResolvedValueOnce('0xaaa');

      const domainLookupResponse = await onNameLookup({
        chainId: 'eip155:1',
        domain: 'foo.bar',
      });

      expect(d3ConnectMock.resolve).toHaveBeenCalledWith('foo.bar', 'ETH');
      expect(domainLookupResponse?.resolvedAddresses?.[0].resolvedAddress).toBe(
        '0xaaa',
      );
    });

    it('should return undefined for non existing chain', async () => {
      const domainLookupResponse = await onNameLookup({
        chainId: 'eip155:1337',
        domain: 'foo.bar',
      });

      expect(d3ConnectMock.resolve).not.toHaveBeenCalled();
      expect(
        domainLookupResponse?.resolvedAddresses?.[0].resolvedAddress,
      ).toBeUndefined();
    });

    it('should return undefined for non existing domain/mapping', async () => {
      d3ConnectMock.resolve.mockResolvedValueOnce(undefined);

      const domainLookupResponse = await onNameLookup({
        chainId: 'eip155:1',
        domain: 'foo.bar',
      });

      expect(d3ConnectMock.resolve).toHaveBeenCalledWith('foo.bar', 'ETH');
      expect(
        domainLookupResponse?.resolvedAddresses?.[0].resolvedAddress,
      ).toBeUndefined();
    });
  });

  describe('Reverse Resolution', () => {
    it('should reverse resolve existing address', async () => {
      d3ConnectMock.reverseResolve.mockResolvedValueOnce('foo.bar');

      const addressLookupResponse = await onNameLookup({
        chainId: 'eip155:1',
        address: '0xaaa',
      });

      expect(d3ConnectMock.reverseResolve).toHaveBeenCalledWith('0xaaa', 'ETH');
      expect(addressLookupResponse?.resolvedDomains?.[0].resolvedDomain).toBe(
        'foo.bar',
      );
    });

    it('should return resolved chain regardless of chain', async () => {
      d3ConnectMock.reverseResolve.mockResolvedValueOnce('foo.bar');

      const addressLookupResponse = await onNameLookup({
        chainId: 'eip155:1337',
        address: '0xaaa',
      });

      expect(d3ConnectMock.reverseResolve).toHaveBeenCalledWith('0xaaa', 'ETH');
      expect(addressLookupResponse?.resolvedDomains?.[0].resolvedDomain).toBe(
        'foo.bar',
      );
    });

    it('should return undefined for non existing address', async () => {
      d3ConnectMock.reverseResolve.mockResolvedValueOnce(undefined);

      const addressLookupResponse = await onNameLookup({
        chainId: 'eip155:1',
        address: '0xbbb',
      });

      expect(d3ConnectMock.reverseResolve).toHaveBeenCalledWith('0xbbb', 'ETH');
      expect(
        addressLookupResponse?.resolvedDomains?.[0].resolvedDomain,
      ).toBeUndefined();
    });
  });
});
