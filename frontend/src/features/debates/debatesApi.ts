import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import axiosInstance from '../../config/api.ts';

export const debatesApi = createApi({
  reducerPath: 'debatesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/debates',
    credentials: 'include',
  }),
  tagTypes: ['Debate'],
  endpoints: (builder) => ({
    generateDebate: builder.mutation({
      queryFn: async (questionId: number) => {
        try {
          const response = await axiosInstance.post(`/api/v1/debates/generate/${questionId}`);
          return { data: response.data.data };
        } catch (error: any) {
          return { error: error.response?.data?.error || 'Failed to generate debate' };
        }
      },
      invalidatesTags: ['Debate'],
    }),

    getDebate: builder.query({
      queryFn: async ({ questionId, userId }: { questionId: number; userId?: number }) => {
        try {
          const url = userId 
            ? `/api/v1/debates/question/${questionId}?userId=${userId}`
            : `/api/v1/debates/question/${questionId}`;
          const response = await axiosInstance.get(url);
          return { data: response.data.data };
        } catch (error: any) {
          return { error: error.response?.data?.error || 'Failed to fetch debate' };
        }
      },
      providesTags: ['Debate'],
    }),

    voteOnDebate: builder.mutation({
      queryFn: async ({ debateId, userId, vote }: { debateId: number; userId: number; vote: string }) => {
        try {
          const response = await axiosInstance.post('/api/v1/debates/vote', {
            debateId,
            userId,
            vote,
          });
          return { data: response.data.data };
        } catch (error: any) {
          return { error: error.response?.data?.error || 'Failed to record vote' };
        }
      },
      invalidatesTags: ['Debate'],
    }),
  }),
});

export const {
  useGenerateDebateMutation,
  useGetDebateQuery,
  useVoteOnDebateMutation,
} = debatesApi;
