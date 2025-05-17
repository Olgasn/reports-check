import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '@api';
import { Routes } from '@routes';
import { WsWrapper } from '@shared';
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
