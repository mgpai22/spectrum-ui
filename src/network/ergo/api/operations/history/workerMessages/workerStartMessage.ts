import { AmmDexOperation } from 'ergo-dex-sdk-custom';

import { Dictionary } from '../../../../../../common/utils/Dictionary';

export interface WorkerStartMessageData {
  readonly addresses: string[];
  readonly oldHandledTxs: Dictionary<Dictionary<boolean>>;
  readonly oldOperations: Dictionary<AmmDexOperation[]>;
}

export interface WorkerStartMessage {
  readonly message: 'start';
  readonly payload: WorkerStartMessageData;
}
