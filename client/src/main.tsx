import { queryClient } from '@api';
import { WsWrapper } from '@components';
import { Routes } from '@routes';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter(Routes);

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <WsWrapper>
      <RouterProvider router={router} />
    </WsWrapper>
  </QueryClientProvider>
);
