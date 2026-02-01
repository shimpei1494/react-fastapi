import { MantineProvider } from '@mantine/core';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import App from './App';
import ChatPage from './routes/ChatPage';
import { theme } from './theme';

import '@mantine/core/styles.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/chat" replace /> },
      { path: 'chat', element: <ChatPage /> },
    ],
  },
]);

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <NuqsAdapter>
        <RouterProvider router={router} />
      </NuqsAdapter>
    </MantineProvider>
  </StrictMode>,
);
