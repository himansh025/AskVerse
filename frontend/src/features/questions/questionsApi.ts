// src/features/questions/questionsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getToken } from '../../utils/token.ts';

// const BASE_URL = 'https://askverse-db8w.onrender.com';
const BASE_URL = "http://localhost:8080";

export const questionsApi = createApi({
  reducerPath: 'questionsApi',
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
  tagTypes: ['Questions'],
  endpoints: (builder) => ({
    getQuestions: builder.query({
      query: ({ page = 0, size = 5 }) => `/api/v1/questions/all?page=${page}&size=${size}`,
      transformResponse: (response: any) => response.data || response,
      providesTags: ['Questions'],
    }),
    getQuestionById: builder.query({
      query: (id) => `/api/v1/questions/${id}`,
      transformResponse: (response: any) => response.data || response,
      providesTags: (result, error, id) => [{ type: 'Questions', id }],
    }),
    createQuestion: builder.mutation({
      query: (body) => ({
        url: '/api/v1/questions',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.data || response,
      invalidatesTags: ['Questions'],
    }),
    deleteQuestion: builder.mutation({
      query: (id) => ({
        url: `/api/v1/questions/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: any) => response.data || response,
      invalidatesTags: ['Questions'],
    }),
  }),
});

export const { useGetQuestionsQuery, useGetQuestionByIdQuery, useCreateQuestionMutation, useDeleteQuestionMutation } = questionsApi;