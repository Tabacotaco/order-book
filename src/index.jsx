import React from 'react';
import styled, { ThemeProvider as StyledProvider, createGlobalStyle } from 'styled-components';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { createRoot } from 'react-dom/client';

import routes from './pages';

import 'react-toastify/dist/ReactToastify.css';


const theme = {
  background: '#131B29',
  defaultStatusBackground: 'rgba(134, 152, 170, 0.12)',
  addStatusBackground: 'rgba(16, 186, 104, 0.12)',
  minusStatusBackground: 'rgba(255, 90, 90, 0.12)',
  hoverBackground: '#1E3059',
  addHighlightBackground: 'rgba(0, 177, 93, 0.5)',
  minusHighlightBackground: 'rgba(255, 91, 90, 0.5)',

  textColor: '#F0F4F8',
  labelTextColor: '#8698aa',
  minusTextColor: '#FF5B5A',
  addTextColor: '#00b15d'
};

const GlobalStyle = createGlobalStyle`
  body {
    background: ${theme.background}; //* styles - background color
    color: ${theme.textColor}; //* styles - default text color
    padding: 0;
    margin: 0;
  }
`;

const App = styled('div')`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden auto;
`;

createRoot(document.getElementById('app'))
  .render(
    <StyledProvider theme={theme}>
      <GlobalStyle />

      <ToastContainer
        newestOnTop
        closeOnClick
        pauseOnHover
        position="top-center"
        autoClose={5000}
      />

      <HashRouter basename="/">
        <App>
          <Routes>
            {routes.map((routeProps) => (
              <Route key={routeProps.path} {...routeProps} />
            ))}
          </Routes>
        </App>
      </HashRouter>
    </StyledProvider>
  );
