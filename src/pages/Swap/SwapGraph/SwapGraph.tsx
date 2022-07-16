import {
  Button,
  Empty,
  Flex,
  LoadingOutlined,
  Spin,
  Tabs,
  Typography,
  useDevice,
} from '@ergolabs/ui-kit';
import { Trans } from '@lingui/macro';
import sortedUniqBy from 'lodash/sortedUniqBy';
import { DateTime } from 'luxon';
import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import styled from 'styled-components';

import { useObservable } from '../../../common/hooks/useObservable';
import { AmmPool } from '../../../common/models/AmmPool';
import { PoolChartData } from '../../../common/models/PoolChartData';
import { AssetPairTitle } from '../../../components/AssetPairTitle/AssetPairTitle';
import { DateTimeView } from '../../../components/common/DateTimeView/DateTimeView';
import { Truncate } from '../../../components/Truncate/Truncate';
import { getPoolChartData } from '../../../network/ergo/api/poolChart/poolChart';
import { Difference } from './Difference/Difference';
import { useAggregatedByDateData } from './useAggregatedByDateData';
import { Period, usePeriodSettings } from './usePeriodSettings';
import { useTicks } from './useTicks';

interface SwapGraphProps {
  pool?: AmmPool;
}

interface AbsoluteContainerProps {
  className?: string;
  children?: ReactNode;
}

const _AbsoluteContainer: React.FC<AbsoluteContainerProps> = ({
  className,
  children,
}) => (
  <Flex
    position="absolute"
    col
    justify="center"
    className={className}
    align="center"
  >
    {children}
  </Flex>
);

const AbsoluteContainer = styled(_AbsoluteContainer)`
  top: 60px;
  border-radius: 8px;
  left: 0;
  right: 0;
  bottom: 0;
`;

export const SwapGraph: React.FC<SwapGraphProps> = ({ pool }) => {
  const [defaultActivePeriod, setDefaultActivePeriod] = useState<Period>('D');
  const { s, valBySize } = useDevice();
  const [isInverted, setInverted] = useState(false);
  const { durationOffset, timeFormat, tick, resolution } =
    usePeriodSettings(defaultActivePeriod);

  const ticks = useTicks(tick, durationOffset, [defaultActivePeriod]);
  const [rawData, loading] = useObservable(
    () =>
      getPoolChartData(pool, {
        from: DateTime.now().minus(durationOffset).valueOf(),
        resolution,
      }),
    [pool?.id, defaultActivePeriod],
    [],
  );
  const data = useAggregatedByDateData(rawData, ticks);
  // recharts couldn't animate when dataKey is changed
  const chartData = useMemo(() => [...data], [data, isInverted]);

  const [activeData, setActiveData] = useState<PoolChartData | null>();

  const isEmpty = data.length === 0;

  const formatXAxis = useCallback(
    (ts: number | string) => {
      if (typeof ts === 'string') {
        return ts;
      }
      return DateTime.fromMillis(ts).toLocaleString(timeFormat);
    },
    [defaultActivePeriod],
  );

  const dataKey = (data: PoolChartData) => data.getRatio(isInverted).valueOf();

  const active = activeData ?? data[data.length - 1];
  const differenceX = data[0];
  const differenceY = data[data.length - 1];
  const showDiff = !activeData;

  const displayedTicks = useMemo(
    () =>
      sortedUniqBy(
        ticks.filter((a) => a.valueOf() > data[0]?.ts),
        (a) => a.toLocaleString(timeFormat),
      ).map((a) => a.valueOf()),
    [data, ticks, timeFormat],
  );
  const tabs = (
    <Tabs
      defaultActiveKey={defaultActivePeriod}
      onChange={(key) => setDefaultActivePeriod(key)}
    >
      <Tabs.TabPane tab="D" key="D" />
      <Tabs.TabPane tab="W" key="W" />
      <Tabs.TabPane tab="M" key="M" />
      <Tabs.TabPane tab="Y" key="Y" />
    </Tabs>
  );

  return (
    <Flex col position="relative">
      <Flex.Item marginTop={4} marginLeft={4} marginRight={4}>
        <Flex align="center">
          {pool && (
            <>
              <Flex.Item marginRight={1}>
                <AssetPairTitle
                  size="small"
                  assetX={pool.x.asset}
                  assetY={pool.y.asset}
                  level={4}
                />
              </Flex.Item>
              <Flex.Item marginRight={2}>
                <Button size="small" onClick={() => setInverted(!isInverted)}>
                  <Trans>Switch ratio</Trans>
                </Button>
              </Flex.Item>
            </>
          )}
          {!s && <Flex.Item marginLeft="auto">{tabs}</Flex.Item>}
        </Flex>
      </Flex.Item>
      {active && !isEmpty && (
        <Flex.Item
          marginTop={valBySize(2, 0)}
          position="absolute"
          style={{ top: 0, left: 0 }}
        >
          <Flex align="flex-end">
            <Flex.Item marginLeft={4} marginRight={2}>
              <Typography.Title level={valBySize(4, 2)}>
                {active.getRatio(isInverted).toString()}
              </Typography.Title>
            </Flex.Item>
            <Flex.Item marginBottom={0.5} marginRight={2}>
              <Typography.Title level={valBySize(5, 4)}>
                <Truncate>
                  {active.getRatio(isInverted).baseAsset.ticker}
                </Truncate>
                {' / '}
                <Truncate>
                  {active.getRatio(isInverted).quoteAsset.ticker}
                </Truncate>
              </Typography.Title>
            </Flex.Item>
            <Flex.Item marginBottom={0.5}>
              {showDiff && (
                <Difference
                  level={valBySize(5, 4)}
                  ratioX={differenceX.getRatio(isInverted)}
                  ratioY={differenceY.getRatio(isInverted)}
                />
              )}
            </Flex.Item>
          </Flex>
          <Flex.Item
            marginLeft={valBySize(4, 6)}
            marginBottom={valBySize(1, 0)}
            marginTop={valBySize(1, 0)}
          >
            <Typography.Text
              style={{
                fontSize: valBySize('12px', '14px'),
              }}
              type="secondary"
            >
              <DateTimeView type="datetimeWithWeekday" value={active.date} />
            </Typography.Text>
          </Flex.Item>
        </Flex.Item>
      )}
      {s && (
        <Flex.Item
          marginLeft={4}
          marginRight={4}
          marginBottom={2}
          marginTop={2}
        >
          {tabs}
        </Flex.Item>
      )}
      <Flex.Item
        marginTop={!active || isEmpty ? 14 : 0}
        marginLeft={4}
        marginRight={4}
        position="relative"
      >
        <ResponsiveContainer
          width={valBySize<string | number>('100%', 624)}
          height={valBySize(pool ? 320 : 440, pool ? 320 : 230)}
        >
          <AreaChart
            data={chartData}
            reverseStackOrder
            onMouseMove={(state: any) => {
              setActiveData(state?.activePayload?.[0]?.payload);
            }}
            syncMethod="index"
            onMouseLeave={() => setActiveData(null)}
            style={{
              visibility: isEmpty || loading ? 'hidden' : 'visible',
            }}
          >
            <YAxis
              dataKey={dataKey}
              type="number"
              domain={['auto', 'auto']}
              hide
            />
            <XAxis
              dataKey="ts"
              type="number"
              scale="time"
              domain={['dataMin', 'dataMax']}
              ticks={displayedTicks}
              tickFormatter={formatXAxis}
            />
            <defs>
              <linearGradient id="gradientColor" x1="0" y1="0" x2="0" y2="1">
                <stop
                  stopColor="var(--ergo-primary-color-hover)"
                  stopOpacity="0.5"
                />
                <stop
                  offset="1"
                  stopColor="var(--ergo-primary-color-hover)"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>
            <Tooltip
              wrapperStyle={{ display: 'none' }}
              formatter={() => null}
            />
            <Area
              dataKey={dataKey}
              stroke="var(--ergo-primary-color-hover)"
              fill="url(#gradientColor)"
            />
          </AreaChart>
        </ResponsiveContainer>

        {isEmpty && !loading && (
          <AbsoluteContainer>
            <Empty>
              <Typography.Text>
                {pool ? (
                  <Trans>Not enough data</Trans>
                ) : (
                  <Trans>Select a token</Trans>
                )}
              </Typography.Text>
            </Empty>
          </AbsoluteContainer>
        )}
        {loading && (
          <AbsoluteContainer>
            <Spin indicator={<LoadingOutlined />} size="large" />
            <Typography.Footnote style={{ fontSize: '16px' }}>
              <Trans>Loading</Trans>
            </Typography.Footnote>
          </AbsoluteContainer>
        )}
      </Flex.Item>
    </Flex>
  );
};
