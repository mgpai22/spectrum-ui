import { PoolId } from '@ergolabs/ergo-dex-sdk';
import React, { FC, useEffect } from 'react';
import { useParams } from 'react-router';
import { skip } from 'rxjs';

import {
  useObservable,
  useSubject,
  useSubscription,
} from '../../common/hooks/useObservable';
import { Currency } from '../../common/models/Currency';
import { FormHeader } from '../../components/common/FormView/FormHeader/FormHeader';
import { FormPairSection } from '../../components/common/FormView/FormPairSection/FormPairSection';
import { FormSection } from '../../components/common/FormView/FormSection/FormSection';
import { FormSlider } from '../../components/common/FormView/FormSlider/FormSlider';
import {
  openConfirmationModal,
  Operation,
} from '../../components/ConfirmationModal/ConfirmationModal';
import { FormPageWrapper } from '../../components/FormPageWrapper/FormPageWrapper';
import { SubmitButton } from '../../components/SubmitButton/SubmitButton';
import { Flex, Skeleton } from '../../ergodex-cdk';
import {
  Form,
  FormGroup,
  useForm,
} from '../../ergodex-cdk/components/Form/NewForm';
import { PoolData } from '../../services/new/pools';
import { getAvailablePoolDataById } from '../../services/new/pools';
import { ConfirmRemoveModal } from './ConfirmRemoveModal/ConfirmRemoveModal';

interface RemoveFormModel {
  readonly percent: number;
  readonly xAmount?: Currency;
  readonly yAmount?: Currency;
}

export const Remove: FC = () => {
  const { poolId } = useParams<{ poolId: PoolId }>();
  const [poolData, updatePoolData] = useSubject(getAvailablePoolDataById);
  const form = useForm<RemoveFormModel>({
    percent: 100,
    xAmount: undefined,
    yAmount: undefined,
  });

  const [formValue] = useObservable(form.valueChangesWithSilent$);

  useEffect(() => updatePoolData(poolId), []);

  useSubscription(
    form.controls.percent.valueChanges$.pipe(skip(1)),
    (percent) => {
      form.patchValue({
        xAmount:
          percent === 100
            ? poolData?.xAmount
            : poolData?.xAmount.percent(percent),
        yAmount:
          percent === 100
            ? poolData?.yAmount
            : poolData?.yAmount.percent(percent),
      });
    },
    [poolData],
  );

  const handleRemove = (
    form: FormGroup<RemoveFormModel>,
    poolData: PoolData,
  ) => {
    const xAmount = form.value.xAmount || poolData.xAmount;
    const yAmount = form.value.yAmount || poolData.yAmount;

    openConfirmationModal(
      (next) => {
        return (
          <ConfirmRemoveModal
            onClose={next}
            xAmount={xAmount}
            yAmount={yAmount}
            pool={poolData.pool}
            lpToRemove={poolData.lpAmount}
          />
        );
      },
      Operation.REMOVE_LIQUIDITY,
      {
        xAsset: xAmount,
        yAsset: yAmount,
      },
    );
  };

  return (
    <FormPageWrapper width={382} title="Remove liquidity" withBackButton>
      {poolData ? (
        <Form form={form} onSubmit={(form) => handleRemove(form, poolData)}>
          <Flex direction="col">
            <Flex.Item marginBottom={2}>
              <FormHeader x={poolData.xAmount} y={poolData.yAmount} />
            </Flex.Item>

            <Flex.Item marginBottom={4}>
              <FormSection title="Amount" noPadding>
                <Form.Item name="percent">
                  {({ value, onChange }) => (
                    <FormSlider value={value} onChange={onChange} />
                  )}
                </Form.Item>
              </FormSection>
            </Flex.Item>

            <Flex.Item marginBottom={4}>
              <FormPairSection
                title="Assets to remove"
                xAmount={formValue?.xAmount || poolData.xAmount}
                yAmount={formValue?.yAmount || poolData.yAmount}
              />
            </Flex.Item>

            {/*TODO: ADD_FEES_DISPLAY_AFTER_SDK_UPDATE[EDEX-468]*/}
            {/*<Flex.Item marginBottom={4}>*/}
            {/*  <TokenSpace title="Earned Fees" pair={pair} fees />*/}
            {/*</Flex.Item>*/}

            <Flex.Item>
              <SubmitButton disabled={!formValue?.percent} htmlType="submit">
                Remove
              </SubmitButton>
            </Flex.Item>
          </Flex>
        </Form>
      ) : (
        <Skeleton active />
      )}
    </FormPageWrapper>
  );
};
