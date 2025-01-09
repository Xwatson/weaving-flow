import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Bookmark {
  id: string;
  url: string;
  title: string;
  description?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface BookmarkState {
  bookmarks: Bookmark[];
  selectedBookmark: Bookmark | null;
  loading: boolean;
  error: string | null;
}

const initialState: BookmarkState = {
  bookmarks: [],
  selectedBookmark: null,
  loading: false,
  error: null,
};

const bookmarkSlice = createSlice({
  name: 'bookmark',
  initialState,
  reducers: {
    setBookmarks: (state, action: PayloadAction<Bookmark[]>) => {
      state.bookmarks = action.payload;
    },
    setSelectedBookmark: (state, action: PayloadAction<Bookmark | null>) => {
      state.selectedBookmark = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setBookmarks,
  setSelectedBookmark,
  setLoading,
  setError,
} = bookmarkSlice.actions;

export default bookmarkSlice.reducer;
