export const API_BASE = import.meta.env.VITE_API_URL;

export const ENDPOINTS = {
  SIGNUP: '/api/v1/users/signup',
  SIGNIN: '/api/v1/users/signin',
  USERS: '/api/v1/users',
  USER_BY_ID: (id: number) => `/api/v1/users/${id}`,
  FOLLOW_TAG: (userId: number, tagId: number) => `/api/v1/users/${userId}/followTag/${tagId}`,
  QUESTIONS: '/api/v1/questions',
  QUESTION_BY_ID: (id: number) => `/api/v1/questions/${id}`,
  ANSWERS: '/api/v1/answers',
  ANSWERS_BY_QUESTION: (questionId: number) => `/api/v1/answers/question/${questionId}`,
  ANSWER_BY_ID: (id: number) => `/api/v1/answers/${id}`,
  COMMENTS: '/api/v1/comments',
  COMMENTS_BY_ANSWER: (answerId: number) => `/api/v1/comments/answer/${answerId}`,
  COMMENTS_BY_COMMENT: (commentId: number) => `/api/v1/comments/comment/${commentId}`,
  COMMENT_BY_ID: (id: number) => `/api/v1/comments/${id}`,
  FEED: (userId: number) => `/api/v1/feed/${userId}`,
  SUBSCRIPTION_CREATOR: (creatorId: number, viewerUserId?: number) =>
    `/api/v1/subscriptions/creator?creatorId=${creatorId}${viewerUserId ? `&viewerUserId=${viewerUserId}` : ''}`,
  SUBSCRIPTION_STATUS: (creatorId: number, subscriberId: number) =>
    `/api/v1/subscriptions/status?creatorId=${creatorId}&subscriberId=${subscriberId}`,
  SUBSCRIPTION_CHECKOUT: '/api/v1/subscriptions/checkout',
  SUBSCRIPTION_CONFIRM: '/api/v1/subscriptions/confirm',
  // Assuming tags endpoint exists based on spec inference
  TAGS: '/api/v1/tags',
};
