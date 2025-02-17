import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "./slices/authSlice";
import workflowReducer from "./slices/workflowSlice";
import bookmarkReducer from "./slices/bookmarkSlice";
import crawlerReducer from "./slices/crawlerSlice";
import credentialReducer from "./slices/credentialSlice";
import themeReducer from "./slices/themeSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workflow: workflowReducer,
    bookmark: bookmarkReducer,
    crawler: crawlerReducer,
    credential: credentialReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware(),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
