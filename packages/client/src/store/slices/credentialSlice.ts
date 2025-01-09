import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Credential {
  id: string;
  name: string;
  type: 'api_key' | 'oauth' | 'basic_auth';
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface CredentialState {
  credentials: Credential[];
  selectedCredential: Credential | null;
  loading: boolean;
  error: string | null;
}

const initialState: CredentialState = {
  credentials: [],
  selectedCredential: null,
  loading: false,
  error: null,
};

const credentialSlice = createSlice({
  name: 'credential',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<Credential[]>) => {
      state.credentials = action.payload;
    },
    setSelectedCredential: (state, action: PayloadAction<Credential | null>) => {
      state.selectedCredential = action.payload;
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
  setCredentials,
  setSelectedCredential,
  setLoading,
  setError,
} = credentialSlice.actions;

export default credentialSlice.reducer;
