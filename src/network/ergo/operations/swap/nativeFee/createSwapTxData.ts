import { AssetAmount, ErgoBox, TransactionContext } from '@ergolabs/ergo-sdk';
import { NetworkContext } from '@ergolabs/ergo-sdk/build/main/entities/networkContext';
import { SwapParams } from 'ergo-dex-sdk-custom';
import {
  SwapExtremums,
  swapVars,
} from 'ergo-dex-sdk-custom/build/main/amm/common/math/swap';
import { NativeExFeeType } from 'ergo-dex-sdk-custom/build/main/types';
import { first, map, Observable, zip } from 'rxjs';

import { Currency } from '../../../../../common/models/Currency';
import { getBaseInputParameters } from '../../../../../utils/walletMath';
import { ErgoAmmPool } from '../../../api/ammPools/ErgoAmmPool';
import { networkContext$ } from '../../../api/networkContext/networkContext';
import { calculateUiFee } from '../../../api/uiFee/uiFee';
import { utxos$ } from '../../../api/utxos/utxos';
import { minExFee$ } from '../../../settings/executionFee/nativeExecutionFee';
import { minerFee$ } from '../../../settings/minerFee';
import { ErgoSettings, settings$ } from '../../../settings/settings';
import { maxTotalFee$, minTotalFee$ } from '../../../settings/totalFees';
import { getInputs } from '../../common/getInputs';
import { getTxContext } from '../../common/getTxContext';

interface SwapOperationCandidateParams {
  readonly pool: ErgoAmmPool;
  readonly from: Currency;
  readonly to: Currency;
  readonly settings: ErgoSettings;
  readonly utxos: ErgoBox[];
  readonly minerFee: Currency;
  readonly minExFee: Currency;
  // TODO: refactor in SDK || or here in frontend repo (operations: swap, redeem, deposit, refund)
  readonly networkContext:
    | NetworkContext
    | {
        readonly height: number;
        readonly lastBlockId: number;
      };
  readonly nitro: number;
  readonly minTotalFee: Currency;
  readonly maxTotalFee: Currency;
  readonly uiFee: Currency;
}

export interface AdditionalData {
  readonly pool: ErgoAmmPool;
  readonly minTotalFee: Currency;
  readonly maxTotalFee: Currency;
  readonly p2pkaddress: string;
}

const toSwapOperationArgs = ({
  from,
  to,
  settings,
  pool,
  minerFee,
  networkContext,
  utxos,
  minExFee,
  nitro,
  minTotalFee,
  maxTotalFee,
  // @ts-ignore
  uiFee,
}: SwapOperationCandidateParams): [
  SwapParams<NativeExFeeType>,
  TransactionContext,
  AdditionalData,
] => {
  if (!settings.address || !settings.pk) {
    throw new Error('[swap]: wallet address is not selected');
  }

  const { baseInput, baseInputAmount, minOutput } = getBaseInputParameters(
    pool,
    {
      inputAmount: from,
      slippage: settings.slippage,
    },
  );
  const swapVariables: [number, SwapExtremums] | undefined = swapVars(
    minExFee.amount,
    nitro,
    minOutput,
  );

  if (!swapVariables) {
    throw new Error('[swap]: an error occurred in swapVariables');
  }

  const [exFeePerToken, extremum] = swapVariables;

  const inputs = getInputs(
    utxos,
    [new AssetAmount(from.asset, baseInputAmount)],
    {
      minerFee: minerFee.amount,
      uiFee: 0n,
      exFee: extremum.maxExFee,
    },
  );

  const swapParams: SwapParams<NativeExFeeType> = {
    poolId: pool.pool.id,
    pk: settings.pk,
    baseInput,
    minQuoteOutput: extremum.minOutput.amount,
    exFeePerToken,
    uiFee: 0n,
    quoteAsset: to.asset.id,
    poolFeeNum: pool.pool.poolFeeNum,
    maxExFee: extremum.maxExFee,
  };
  const txContext: TransactionContext = getTxContext(
    inputs,
    networkContext as NetworkContext,
    settings.address,
    minerFee.amount,
  );
  const additionalData: AdditionalData = {
    pool,
    minTotalFee,
    maxTotalFee,
    p2pkaddress: settings.address,
  };

  return [swapParams, txContext, additionalData];
};

export const createSwapTxData = (
  pool: ErgoAmmPool,
  from: Currency,
  to: Currency,
): Observable<
  [SwapParams<NativeExFeeType>, TransactionContext, AdditionalData]
> =>
  zip([
    settings$,
    utxos$,
    minerFee$,
    minExFee$,
    networkContext$,
    minTotalFee$,
    maxTotalFee$,
    calculateUiFee(from).pipe(first()),
  ]).pipe(
    first(),
    map(
      ([
        settings,
        utxos,
        minerFee,
        minExFee,
        networkContext,
        minTotalFee,
        maxTotalFee,
        uiFee,
      ]) =>
        toSwapOperationArgs({
          from,
          to,
          settings,
          pool,
          minerFee,
          networkContext,
          utxos,
          minExFee,
          nitro: settings.nitro,
          minTotalFee,
          maxTotalFee,
          uiFee,
        }),
    ),
  );
