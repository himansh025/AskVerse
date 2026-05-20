// src/features/answers/answersApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const BASE_URL = 'https://askverse-db8w.onrender.com';
 const BASE_URL = import.meta.env.VITE_API_URL;

 export const answersApi = createApi({
  reducerPath: 'answersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['Answers'],
  endpoints: (builder) => ({
    getAnswersByQuestion: builder.query({
      query: ({ questionId, page = 0, size = 10 }) => `/api/v1/answers/question/${questionId}?page=${page}&size=${size}`,
      providesTags: ['Answers'],
    }),
    createAnswer: builder.mutation({
      query: (body) => ({
        url: '/api/v1/answers',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Answers'],
    }),
    deleteAnswer: builder.mutation({
      query: (id) => ({
        url: `/api/v1/answers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Answers'],
    }),
  }),
});

export const { useGetAnswersByQuestionQuery, useCreateAnswerMutation, useDeleteAnswerMutation } = answersApi;
