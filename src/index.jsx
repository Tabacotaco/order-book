import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider as StyledProvider, createGlobalStyle } from 'styled-components';

const theme = {

};

const GlobalStyle = createGlobalStyle`
  body {
    background: #131B29;
    color: #F0F4F8;
  }
`;

createRoot(document.getElementById('app'))
  .render(
    <StyledProvider theme={theme}>
      <GlobalStyle />

      <HashRouter basename="/">
        TEST
      </HashRouter>
    </StyledProvider>
  );
