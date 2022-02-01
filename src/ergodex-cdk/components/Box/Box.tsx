import './Box.less';

import cn from 'classnames';
import React from 'react';

import { getGutter, Gutter } from '../../utils/gutter';

interface BoxProps extends React.PropsWithChildren<unknown> {
  borderRadius?: 'xs' | 's' | 'm' | 'l';
  contrast?: boolean;
  gray?: boolean;
  transparent?: boolean;
  inline?: boolean;
  formWrapper?: boolean;
  className?: string;
  padding?: Gutter;
  maxHeight?: number;
  overflow?: boolean;
  onClick?: React.MouseEventHandler<HTMLElement>;
  width?: number;
  tag?: boolean;
  height?: string;
}

const Box = ({
  children,
  className,
  borderRadius,
  contrast,
  gray,
  padding,
  transparent,
  inline,
  onClick,
  formWrapper,
  maxHeight,
  overflow,
  width,
  tag,
  height,
}: BoxProps): JSX.Element => {
  return (
    <div
      className={cn(
        'ergodex-box',
        borderRadius && `ergodex-box--radius-${borderRadius}`,
        contrast && `ergodex-box--contrast`,
        gray && `ergodex-box--gray`,
        transparent && `ergodex-box--transparent`,
        inline && `ergodex-box--inline`,
        formWrapper && `ergodex-box--form-wrapper`,
        tag && `ergodex-box--tag`,
        className,
      )}
      style={{
        padding:
          padding != null
            ? getGutter(padding)
            : `calc(var(--ergo-base-gutter))`,
        maxHeight: `${maxHeight}px`,
        overflow: overflow ? 'auto' : 'none',
        width: width,
        height: height,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export { Box };