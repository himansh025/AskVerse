// src/features/questions/questionsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_API_URL;
// const BASE_URL = "http://localhost:8080";

export const questionsApi = createApi({
  reducerPath: 'questionsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['Questions'],
  endpoints: (builder) => ({
    getQuestions: builder.query({
      query: ({ page = 0, size = 5, viewerUserId }) =>
        `/api/v1/questions/all?page=${page}&size=${size}${viewerUserId ? `&viewerUserId=${viewerUserId}` : ''}`,
      transformResponse: (response: any) => response.data || response,
      providesTags: ['Questions'],
    }),
    getQuestionById: builder.query({
      query: ({ id, viewerUserId }) =>
        `/api/v1/questions/${id}${viewerUserId ? `?viewerUserId=${viewerUserId}` : ''}`,
      transformResponse: (response: any) => response.data || response,
      providesTags: (_result, _error, args) => [{ type: 'Questions', id: args.id }],
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
