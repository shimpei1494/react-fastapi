import { MantineProvider } from '@mantine/core';
import { render } from '@testing-library/react';
import { Provider } from 'jotai';
import type { ReactElement, ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';

interface WrapperProps {
  children: ReactNode;
}

function TestWrapper({ children }: WrapperProps) {
  return (
    <Provider>
      <MantineProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </MantineProvider>
    </Provider>
  );
}

function customRender(ui: ReactElement, options = {}) {
  return render(ui, { wrapper: TestWrapper, ...options });
}

export * from '@testing-library/react';
export { customRender as render };
