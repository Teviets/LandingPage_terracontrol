import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    expect(() =>
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )
    ).not.toThrow();
  });
});
