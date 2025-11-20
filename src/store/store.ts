// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { publicApi } from "./api/publicApi";
import { adminApi } from "./api/adminApi";
import learningSessionReducer from "./slices/learningSessionSlice";

export const store = configureStore({
  reducer: {
    [publicApi.reducerPath]: publicApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    learningSession: learningSessionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(publicApi.middleware)
      .concat(adminApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
