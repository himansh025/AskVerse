// src/features/feed/feedApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const BASE_URL = 'https://askverse-db8w.onrender.com';
const BASE_URL = import.meta.env.VITE_API_URL;

export const feedApi = createApi({
  reducerPath: 'feedApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: 'include',
  }),
  endpoints: (builder) => ({
    getFeed: builder.query({
      query: ({ userId, page = 0, size = 10 }) => `/api/v1/feed/${userId}?page=${page}&size=${size}`,
    }),
  }),
});

export const { useGetFeedQuery } = feedApi; 
