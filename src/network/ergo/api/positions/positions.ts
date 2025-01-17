import { blocksToMillis } from 'ergo-dex-sdk-custom';
import { DateTime } from 'luxon';
import {
  combineLatest,
  debounceTime,
  map,
  publishReplay,
  refCount,
} from 'rxjs';

import { Currency } from '../../../../common/models/Currency.ts';
import { FarmStatus } from '../../../../common/models/Farm';
import { Position } from '../../../../common/models/Position';
import { farms$ } from '../../lm/api/farms/farms';
import { allAmmPools$ } from '../ammPools/ammPools';
import { lpBalance$ } from '../balance/lpBalance';
import { tokenLocksGroupedByLpAsset$ } from '../common/tokenLocks';
import { networkContext$ } from '../networkContext/networkContext';

export const positions$ = combineLatest([
  allAmmPools$,
  lpBalance$,
  tokenLocksGroupedByLpAsset$,
  networkContext$,
  farms$,
]).pipe(
  debounceTime(300),
  map(
    ([
      ammPools,
      lpWalletBalance,
      tokenLocksGroupedByLpAsset,
      networkContext,
      farms,
    ]) => {
      return ammPools
        .map((ammPool) => ({
          ammPool,
          farms: farms.filter(
            (f) =>
              f.ammPool.id === ammPool.id &&
              (f.status !== FarmStatus.Finished || f.yourStakeLq.isPositive()),
          ),
        }))
        .filter(
          ({ ammPool, farms }) =>
            lpWalletBalance.get(ammPool.lp.asset).isPositive() ||
            tokenLocksGroupedByLpAsset[ammPool.lp.asset.id]?.length > 0 ||
            farms.some((f) => f.yourStakeLq.isPositive()),
        )
        .map(
          ({ ammPool, farms }) =>
            new Position(
              ammPool,
              lpWalletBalance.get(ammPool.lp.asset),
              false,
              tokenLocksGroupedByLpAsset[ammPool.lp.asset.id]?.map((item) => ({
                deadline: item.deadline,
                redeemer: item.redeemer,
                active: item.active,
                currentBlock: networkContext.height,
                lockedAsset: new Currency(
                  item.lockedAsset.amount,
                  ammPool.lp.asset,
                ),
                boxId: item.boxId,
                unlockDate: DateTime.now().plus({
                  millisecond: Number(
                    blocksToMillis(item.deadline - networkContext.height - 1),
                  ),
                }),
              })) || [],
              farms,
            ),
        );
    },
  ),
  publishReplay(1),
  refCount(),
);
