import React from 'react';
import styled from 'styled-components';

import QuoteDataTable from '@components/QuoteDataTable';


//* Components
const Container = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;

  & > .data-list {
    width: 240px;
    max-width: 100%;
  }
`;

export default function Home() {
  return (
    <Container>
      <QuoteDataTable className="data-list" title="Order Book" />
    </Container>
  );
}
