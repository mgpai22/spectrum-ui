import './LiquidityDatePicker.less';

import { millisToBlocks } from 'ergo-dex-sdk-custom';
import { DatePicker, Flex, Typography } from '@ergolabs/ui-kit';
import { t } from '@lingui/macro';
import { DateTime } from 'luxon';
import * as React from 'react';

import { useObservable } from '../../../../../common/hooks/useObservable';
import { IsErgo } from '../../../../../components/IsErgo/IsErgo.tsx';
import { networkContext$ } from '../../../../../network/ergo/api/networkContext/networkContext';
import { formatToInt } from '../../../../../services/number';
import { getLockingPeriodString } from '../../../utils';

interface LockLiquidityDatePickerProps {
  selectedPrefix: string;
  value?: DateTime | null | undefined;
  defaultValue?: string;
  onChange: (value: DateTime | null | undefined) => void;
  disabledDate?: (c: DateTime) => boolean;
}

const LiquidityDatePicker: React.FC<LockLiquidityDatePickerProps> = ({
  value,
  defaultValue,
  onChange,
  disabledDate,
  selectedPrefix,
}) => {
  const [network] = useObservable(networkContext$);
  const handleChange = (date: DateTime | null) => {
    onChange(date);
  };

  const block =
    network?.height && value
      ? network.height +
        millisToBlocks(BigInt(value.toMillis() - DateTime.now().toMillis())) +
        1
      : undefined;

  return (
    <Flex
      className="liquidity-date-picker"
      align="center"
      justify="space-between"
    >
      <Flex.Item>
        {value ? (
          <Flex col>
            <Flex.Item marginBottom={1}>
              <Typography.Title level={5}>
                {value?.toLocaleString(DateTime.DATE_FULL)}{' '}
                <IsErgo>
                  {block ? t`(Block: ${formatToInt(block)})` : ''}
                </IsErgo>
              </Typography.Title>
            </Flex.Item>
            <Flex.Item>
              <Typography.Body strong secondary>
                {selectedPrefix}: {getLockingPeriodString(value)}
              </Typography.Body>
            </Flex.Item>
          </Flex>
        ) : (
          <Typography.Title
            style={{ color: 'var(--spectrum-disabled-text-contrast)' }}
            level={5}
          >
            {defaultValue ? defaultValue : t`Choose Date`}
          </Typography.Title>
        )}
      </Flex.Item>
      <Flex.Item>
        <DatePicker
          dropdownClassName="liquidity-date-picker__dropdown"
          size="large"
          value={value}
          disabledDate={
            disabledDate
              ? disabledDate
              : (current: DateTime) => {
                  return current <= DateTime.now();
                }
          }
          onChange={handleChange}
          allowClear={false}
        />
      </Flex.Item>
    </Flex>
  );
};

export { LiquidityDatePicker };
