// src/features/auth/authSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import { removeToken, setToken } from '../../utils/token.ts';

interface AuthState {
  user: any | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      setToken(action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      removeToken();
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;