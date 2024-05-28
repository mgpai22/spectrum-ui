import {
  AmmOrderRefunds,
  AmmOrderRefundsWrapper,
  DefaultAmmOrdersParser,
  DefaultAmmPoolsInfoParser,
} from 'ergo-dex-sdk-custom';

import { mainnetTxAssembler } from './defaultTxAssembler';
import { explorer } from './explorer';
import yoroiProver from './yoroi/prover';

export const ergopayAmmOrderRefunds = new AmmOrderRefunds(explorer);

export const ammOrderRefunds = new AmmOrderRefundsWrapper(
  ergopayAmmOrderRefunds,
  yoroiProver,
  mainnetTxAssembler,
);

export const ordersParser = new DefaultAmmOrdersParser();

export const poolsInfoParser = new DefaultAmmPoolsInfoParser();
