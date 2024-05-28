import { LmPool, makeLmPools, Pools } from 'ergo-dex-sdk-custom';

import { explorer } from '../../../../../services/explorer';

export const networkLmPools = (() => {
  let networkPools: Pools<LmPool>;
  return (): Pools<LmPool> => {
    if (!networkPools) {
      networkPools = makeLmPools(explorer);
    }

    return networkPools;
  };
})();
