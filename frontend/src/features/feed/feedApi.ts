// src/features/feed/feedApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getToken } from '../../utils/token.ts';

const BASE_URL = 'https://askverse-db8w.onrender.com';

export const feedApi = createApi({
  reducerPath: 'feedApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getFeed: builder.query({
      query: ({ userId, page = 0, size = 10 }) => `/api/v1/feed/${userId}?page=${page}&size=${size}`,
    }),
  }),
});

export const { useGetFeedQuery } = feedApi; 