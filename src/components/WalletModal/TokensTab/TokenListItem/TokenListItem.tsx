import React from 'react';

import { Currency } from '../../../../common/models/Currency';
import { Box, Flex, Typography } from '../../../../ergodex-cdk';
import { TokenIcon } from '../../../TokenIcon/TokenIcon';

interface TokenListItemProps {
  readonly currency: Currency;
}

export const TokenListItem: React.FC<TokenListItemProps> = ({ currency }) => (
  <Box padding={[2, 4]}>
    <Flex align="center">
      <Flex.Item flex={1}>
        <Flex align="center">
          <Flex.Item marginRight={2}>
            <TokenIcon name={currency.asset.name} />
          </Flex.Item>
          <Flex direction="col">
            <Typography.Body>{currency.asset.name}</Typography.Body>
            {/*<Typography.Footnote small>{asset.name}</Typography.Footnote>*/}
          </Flex>
        </Flex>
      </Flex.Item>
      <Typography.Body>{currency.toString({ suffix: false })}</Typography.Body>
    </Flex>
  </Box>
);