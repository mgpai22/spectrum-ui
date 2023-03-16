import { Button, Flex, Form, FormGroup, useForm } from '@ergolabs/ui-kit';
import { t } from '@lingui/macro';
import React, { FC, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { first, skip } from 'rxjs';

import { useSubscription } from '../../../../common/hooks/useObservable';
import { Farm } from '../../../../common/models/Farm';
import { TxId } from '../../../../common/types';
import { FormPairSection } from '../../../../components/common/FormView/FormPairSection/FormPairSection';
import { FormSlider } from '../../../../components/common/FormView/FormSlider/FormSlider';
import { PageSection } from '../../../../components/Page/PageSection/PageSection';
import { ergopayLmDeposit } from '../../lm/operations/lmDeposit/ergopayLmDeposit';
import { StakeFormModel } from '../../lm/operations/lmDeposit/LmDepositModalContent/LmDepositModalContent';

export interface LmDepositOpenWalletProps {
  readonly farm: Farm;
  readonly onTxRegister: (p: TxId) => void;
}

export const LmDepositOpenWallet: FC<LmDepositOpenWalletProps> = ({
  farm,
  onTxRegister,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const form = useForm<StakeFormModel>({
    percent: 100,
    xAmount: farm.availableToStakeX,
    yAmount: farm.availableToStakeY,
    lpAmount: farm.availableToStakeLq,
  });
  useSubscription(
    form.controls.percent.valueChangesWithSilent$.pipe(skip(1)),
    (percent) => {
      form.patchValue({
        xAmount:
          percent === 100
            ? farm.availableToStakeX
            : farm.availableToStakeX.percent(percent),
        yAmount:
          percent === 100
            ? farm.availableToStakeY
            : farm.availableToStakeY.percent(percent),
        lpAmount:
          percent === 100
            ? farm.availableToStakeLq
            : farm.availableToStakeLq.percent(percent),
      });
    },
    [],
  );

  const action = (form: FormGroup<StakeFormModel>) => {
    if (form.value.lpAmount) {
      setLoading(true);
      ergopayLmDeposit(farm, form.value.lpAmount)
        .pipe(first())
        .subscribe({
          next: (txId) => {
            setLoading(false);
            onTxRegister(txId);
          },
          error: () => setLoading(false),
        });
    }
  };

  return (
    <Form form={form} onSubmit={action}>
      <Flex col>
        <Flex.Item marginBottom={6}>
          <PageSection title={t`Amount`} noPadding>
            <Flex col>
              <Form.Item name="percent">
                {({ value, onChange }) => (
                  <FormSlider value={value} onChange={onChange} />
                )}
              </Form.Item>
              <Form.Listener>
                {({ value }) => (
                  <FormPairSection
                    noBorder
                    title={''}
                    xAmount={value.xAmount}
                    yAmount={value.yAmount}
                  />
                )}
              </Form.Listener>
            </Flex>
          </PageSection>
        </Flex.Item>
        <Button
          loading={loading}
          size="extra-large"
          type="primary"
          htmlType="submit"
          width="100%"
        >
          {isMobile ? t`Open Wallet` : t`Proceed`}
        </Button>
      </Flex>
    </Form>
  );
};
