import { PARAMS } from '@constants';
import { QueryClient } from '@tanstack/react-query';

import axios from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: PARAMS.QUERY_STORE_TIME,
    },
  },
});

export const api = axios.create({
  baseURL: PARAMS.API_URL,
});
