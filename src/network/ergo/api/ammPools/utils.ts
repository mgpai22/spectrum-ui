import {
  AmmPool,
  makeNativePools,
  makeTokenPools,
  Pools,
} from 'ergo-dex-sdk-custom';

import { explorer } from '../../../../services/explorer';

export const networkPools = (() => {
  let networkPools: Pools<AmmPool>;

  return (): Pools<AmmPool> => {
    if (!networkPools) {
      networkPools = makeTokenPools(explorer);
    }

    return networkPools;
  };
})();

export const nativeNetworkPools = (() => {
  let networkPools: Pools<AmmPool>;

  return (): Pools<AmmPool> => {
    if (!networkPools) {
      networkPools = makeNativePools(explorer);
    }

    return networkPools;
  };
})();
