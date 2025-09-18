import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '@api';
import { Routes } from '@routes';
import { WsWrapper } from '@shared';
import { store } from '@store';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter(Routes);

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <WsWrapper>
        <RouterProvider router={router} />
      </WsWrapper>
    </Provider>
  </QueryClientProvider>
);
