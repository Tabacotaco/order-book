import React from 'react';
import styled from 'styled-components';

const ArrowDownIcon = styled(({ className }) => (
  <svg role="icon" xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" fill-rule="nonzero" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </svg>
))`
  ${({ theme, fontSize = 24, color }) => `
    width: ${fontSize}px;
    height: ${fontSize}px;
    fill: ${theme[color] || theme.textColor};
  `}
`;

const ArrowUpIcon = styled(ArrowDownIcon)`
  transform: rotate(180deg);
`;

export default {
  ArrowDown: ArrowDownIcon,
  ArrowUp: ArrowUpIcon
};
