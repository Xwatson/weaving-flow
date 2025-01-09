import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface CrawlerTask {
  id: string;
  url: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

interface CrawlerState {
  tasks: CrawlerTask[];
  selectedTask: CrawlerTask | null;
  loading: boolean;
  error: string | null;
}

const initialState: CrawlerState = {
  tasks: [],
  selectedTask: null,
  loading: false,
  error: null,
};

const crawlerSlice = createSlice({
  name: 'crawler',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<CrawlerTask[]>) => {
      state.tasks = action.payload;
    },
    setSelectedTask: (state, action: PayloadAction<CrawlerTask | null>) => {
      state.selectedTask = action.payload;
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
  setTasks,
  setSelectedTask,
  setLoading,
  setError,
} = crawlerSlice.actions;

export default crawlerSlice.reducer;
