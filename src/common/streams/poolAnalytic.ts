import axios from 'axios';
import { PoolId } from 'ergo-dex-sdk-custom';
import { DateTime } from 'luxon';
import { from, map, Observable } from 'rxjs';

import { applicationConfig } from '../../applicationConfig';
import { AnalyticsData, LockedAsset } from '../../services/new/analytics';
import { Currency } from '../models/Currency';

export interface AmmPoolAnalytics {
  id: PoolId;
  lockedX: LockedAsset;
  lockedY: LockedAsset;
  tvl: AnalyticsData;
  volume: AnalyticsData;
  fees: AnalyticsData;
  yearlyFeesPercent: number;
}

export const getAggregatedPoolAnalyticsDataById = (
  poolId: PoolId,
  frm?: number,
  to?: number,
): Observable<AmmPoolAnalytics> =>
  from(
    axios.get<AmmPoolAnalytics>(
      `${applicationConfig.networksSettings.ergo.analyticUrl}amm/pool/${poolId}/stats`,
      {
        params: {
          from: frm,
          to,
        },
      },
    ),
  ).pipe(map((res) => res.data));

const get24hData = (url: string): Promise<any> => {
  return axios.get(url, {
    params: {
      from: DateTime.now().minus({ day: 1 }).toMillis(),
    },
  });
};

export const getAggregatedPoolAnalyticsDataById24H = (
  poolId: PoolId,
): Observable<AmmPoolAnalytics> =>
  from(
    get24hData(
      `${applicationConfig.networksSettings.ergo.analyticUrl}amm/pool/${poolId}/stats`,
    ),
  ).pipe(
    map((res) => ({
      ...res.data,
      tvl: res.data.tvl
        ? {
            ...res.data.tvl,
            currency: new Currency(BigInt(res.data.tvl.value), {
              decimals: 2,
              id: 'USD',
            }),
          }
        : undefined,
    })),
  );
