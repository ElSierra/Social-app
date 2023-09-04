import {
  CombinedState,
  combineReducers,
  configureStore,
} from "@reduxjs/toolkit";
import routes, { Route } from "./slice/routes";
import prefs, { Prefs } from "./slice/prefs";
import bottomSheet, { BottomSheet } from "./slice/bottomSheet";
import { reduxStorage } from "./storage";
import post, { postState } from "./slice/post";
import searchPost from "./slice/post/search";
import toast, { ToastState } from "./slice/toast/toast";
import { authApi } from "./api/auth";

import user, { UserState } from "./slice/user";
import {
  persistReducer,
  REHYDRATE,
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  PersistConfig,
} from "redux-persist";
import chatList, { ChatList } from "./slice/chat/chatlist";
import { userApi } from "./api/user";
import { servicesApi } from "./api/services";
import loadingModal, { LoadingModal } from "./slice/modal/loading";
import searchPeople, { personState } from "./slice/people/search";
import followers, { FollowerState } from "./slice/user/followers";
import followedPost from "./slice/post/followed";

const persistConfig: PersistConfig<
  CombinedState<{
    routes: Route;
    prefs: Prefs;
    bottomSheet: BottomSheet;
    post: postState;
    searchPost: postState;
    toast: ToastState;
    user: UserState;
    followers: FollowerState;
    searchPeople: personState;
    loadingModal: LoadingModal;
    followedPost: postState;
    chatlist: ChatList;
    [authApi.reducerPath]: any;
    [userApi.reducerPath]: any;
    [servicesApi.reducerPath]: any;
  }>
> = {
  key: "root",
  storage: reduxStorage,
  whitelist: ["routes", "prefs", "user"],
};

const reducer = combineReducers({
  routes,
  prefs,
  bottomSheet,
  post,
  toast,
  loadingModal,
  searchPost,
  followers,
  chatlist: chatList,
  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [servicesApi.reducerPath]: servicesApi.reducer,
  user,
  searchPeople,
  followedPost,
});
const persistedReducer = persistReducer(persistConfig, reducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        immutableCheck: false,
        serializableCheck: false,
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .concat(authApi.middleware)
      .concat(userApi.middleware)
      .concat(servicesApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
