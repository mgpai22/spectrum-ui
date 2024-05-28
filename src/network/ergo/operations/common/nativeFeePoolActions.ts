import {
  makeNativePoolActionsSelector,
  makeSpfPoolActionsSelector,
  makeWrappedNativePoolActionsSelector,
  makeWrappedSpfPoolActionsSelector,
} from 'ergo-dex-sdk-custom';

import { mainnetTxAssembler } from '../../../../services/defaultTxAssembler';
import { uiFeeParams$ } from '../../api/uiFee/uiFee';
import { proverMediator } from './proverMediator';

export const nativeFeePoolActions = makeWrappedNativePoolActionsSelector(
  uiFeeParams$.getValue().address,
  proverMediator,
  mainnetTxAssembler,
);

export const ergoPayNativeFeePoolActions = makeNativePoolActionsSelector(
  uiFeeParams$.getValue().address,
);

export const spfFeePoolActions = makeWrappedSpfPoolActionsSelector(
  uiFeeParams$.getValue().address,
  proverMediator,
  mainnetTxAssembler,
);

export const ergoPaySpfFeePoolActions = makeSpfPoolActionsSelector(
  uiFeeParams$.getValue().address,
);
