// src/features/comments/commentsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_API_URL;

export const commentsApi = createApi({
  reducerPath: 'commentsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['Comments'],
  endpoints: (builder) => ({
    getCommentsByAnswer: builder.query({
      query: ({ answerId, page = 0, size = 10 }) => `/api/v1/comments/answer/${answerId}?page=${page}&size=${size}`,
      providesTags: ['Comments'],
    }),
    createComment: builder.mutation({
      query: (body) => ({
        url: '/api/v1/comments',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Comments'],
    }),
    deleteComment: builder.mutation({
      query: (id) => ({
        url: `/api/v1/comments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Comments'],
    }),
  }),
});

export const { useGetCommentsByAnswerQuery, useCreateCommentMutation, useDeleteCommentMutation } = commentsApi;
