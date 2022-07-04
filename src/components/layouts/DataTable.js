import styled from 'styled-components';


const DataTable = {
  Container: styled('table')`
    display: flex;
    flex-direction: column;
  `,
  Title: styled('caption')`
    ${({ theme, align = 'left', color, fontWeight = 'bolder', padding = '8px 4px' }) => `
      display: flex;
      flex-direction: row;
      font-size: 18px;
      font-weight: ${fontWeight};
      justify-content: ${align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center'};
      padding: ${padding};
      color: ${theme[color] || theme.textColor};
    `}
  `,
  Header: styled('thead')``,
  Body: styled('tbody')`
    ${({ reverse = false }) => `
      display: flex;
      flex-direction: ${reverse ? 'column-reverse' : 'column'};
    `}
  `,
  Row: styled('tr')`
    ${({ theme, background }) => `
      display: flex;
      flex-direction: row;
      transition: background .2s;
      ${theme[background] ? `background: ${theme[background]};` : ''}

      &:hover > * {
        background: ${theme.hoverBackground};
      }
    `}
  `,
  Label: styled('th')`
    ${({ theme }) => `
      color: ${theme.labelTextColor};
      padding: 8px 0;
      font-size: 14px;
    `}
  `,
  Cell: styled('td')`
    ${({ theme, background, color }) => `
      color: ${theme[color] || theme.textColor};
      padding: 4px 0;
      ${theme[background] ? `background: ${theme[background]};` : ''}
    `}
  `
};

Object.entries(DataTable).forEach(([name, element]) => (
  element.displayName = `DataTable${name}`
));

export default DataTable;
