import { mkPoolActions, mkWrappedPoolActions } from 'ergo-dex-sdk-custom';

import { UI_REWARD_ADDRESS } from '../../../../../common/constants/settings';
import { mainnetTxAssembler } from '../../../../../services/defaultTxAssembler';
import { proverMediator } from '../../../operations/common/proverMediator';
import { DefaultInputSelector } from './inputSelector';

const defaultInputSelector = new DefaultInputSelector();

export const lmPoolErgopayActions = mkPoolActions(
  defaultInputSelector,
  UI_REWARD_ADDRESS,
);

export const lmPoolActions = mkWrappedPoolActions(
  defaultInputSelector,
  proverMediator,
  mainnetTxAssembler,
  UI_REWARD_ADDRESS,
);
