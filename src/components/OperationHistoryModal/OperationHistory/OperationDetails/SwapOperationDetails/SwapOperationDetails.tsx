import { t } from '@lingui/macro';
import { FC } from 'react';

import {
  OperationStatus,
  SwapItem,
} from '../../../../../common/models/OperationV2';
import { SingleAssetBox } from '../../common/SingleAssetBox/SingleAssetBox';
import { OperationDetailsContainer } from '../common/OperationDetailsContainer/OperationDetailsContainer';
import { TransactionDetails } from '../common/TransactionDetails/TransactionDetails';
import { TransactionPending } from '../common/TransactionPending/TransactionPending';
import { TransactionRefund } from '../common/TransactionRefund/TransactionRefund';

export interface SwapOperationDetailsProps {
  readonly swapItem: SwapItem;
}

export const SwapOperationDetails: FC<SwapOperationDetailsProps> = ({
  swapItem,
}) => (
  <OperationDetailsContainer
    leftSide={
      <TransactionDetails
        title={t`Placed Order`}
        dateTime={swapItem.registerTx.dateTime}
        transactionId={swapItem.registerTx.id}
        content={<SingleAssetBox currency={swapItem.base} />}
      />
    }
    rightSide={
      <>
        {swapItem.status === OperationStatus.Evaluated && (
          <TransactionDetails
            title={t`Executed Order`}
            dateTime={swapItem.evaluateTx.dateTime}
            transactionId={swapItem.evaluateTx.id}
            content={<SingleAssetBox currency={swapItem.quote} />}
          />
        )}
        {swapItem.status === OperationStatus.Pending && (
          <TransactionPending title={t`Executed Order`} />
        )}
        {swapItem.status === OperationStatus.Refunded && (
          <TransactionDetails
            title={t`Executed Order`}
            dateTime={swapItem.refundTx.dateTime}
            transactionId={swapItem.refundTx.id}
            content={<SingleAssetBox currency={swapItem.base} />}
          />
        )}
        {swapItem.status === OperationStatus.NeedRefund && (
          <TransactionRefund
            pair={[swapItem.base, swapItem.quote]}
            transactionId={swapItem.registerTx.id}
          />
        )}
      </>
    }
  />
);