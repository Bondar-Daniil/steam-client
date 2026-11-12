
import { configureStore } from "@reduxjs/toolkit";
import favoritesReducer from "./favoritesSlice";

export const store = configureStore({
  reducer: {
    favorites: favoritesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

store.subscribe(() => {
  try {
    localStorage.setItem(
      "favoriteGames",
      JSON.stringify(store.getState().favorites.games)
    );
  } catch (error) {
    console.error("Failed to save favorites:", error);
  }
});
