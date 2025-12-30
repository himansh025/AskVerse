import { createSlice } from '@reduxjs/toolkit';

interface DataState {
  profileData: any | null;
  feedData: any | null;
  tagData: any | null;
}

const initialState: DataState = {
  profileData: null,
  feedData: null,
  tagData: null,
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setProfileData: (state, action) => {
      state.profileData = action.payload;
    },
    setFeedData: (state, action) => {
      state.feedData = action.payload;
    },
    setTagData: (state, action) => {
      state.tagData = action.payload;
    },
  },
});

export const { setProfileData, setFeedData, setTagData } = dataSlice.actions;
export default dataSlice.reducer;