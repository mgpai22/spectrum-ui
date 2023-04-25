import { ArrowDownOutlined, Box, Flex } from '@ergolabs/ui-kit';
import { FC } from 'react';
import styled from 'styled-components';

interface ArrowIcon {
  readonly className?: string;
}

const _ArrowIcon: FC<ArrowIcon> = ({ className }) => (
  <div style={{ position: 'relative' }}>
    <Box className={className}>
      <Flex align="center" justify="center" stretch>
        <ArrowDownOutlined style={{ fontSize: 6 }} />
      </Flex>
    </Box>
  </div>
);

export const ArrowIcon = styled(_ArrowIcon)`
  border-radius: 2px;
  color: var(--spectrum-primary-text);
  height: 0.75rem;
  top: -0.5rem;
  left: 50%;
  position: absolute;
  transform: translateX(-50%);
  width: 0.75rem;
  z-index: 1;
`;
