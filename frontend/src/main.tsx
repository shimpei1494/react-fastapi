import { CodeHighlightAdapterProvider, createShikiAdapter } from '@mantine/code-highlight';
import { MantineProvider } from '@mantine/core';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import App from './App';
import ChatPage from './routes/ChatPage';
import PlaygroundPage from './routes/PlaygroundPage';
import { theme } from './theme';

import '@mantine/code-highlight/styles.css';
import '@mantine/core/styles.css';

async function loadShiki() {
  const { createHighlighter } = await import('shiki');
  return await createHighlighter({
    langs: ['python', 'typescript', 'tsx', 'javascript', 'jsx', 'bash', 'json', 'css', 'html'],
    themes: [],
  });
}

const shikiAdapter = createShikiAdapter(loadShiki);

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/chat" replace /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'playground', element: <PlaygroundPage /> },
    ],
  },
]);

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <MantineProvider theme={theme} forceColorScheme="dark">
      <CodeHighlightAdapterProvider adapter={shikiAdapter}>
        <NuqsAdapter>
          <RouterProvider router={router} />
        </NuqsAdapter>
      </CodeHighlightAdapterProvider>
    </MantineProvider>
  </StrictMode>,
);
