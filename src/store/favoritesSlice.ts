
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Game } from "../types/game";

interface FavoritesState {
  games: Game[];
}

function loadFavorites(): Game[] {
  try {
    const saved = localStorage.getItem("favoriteGames");

    if (!saved) {
      return [];
    }

    const parsed: unknown = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is Game =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "number" &&
        typeof item.name === "string"
    );
  } catch {
    return [];
  }
}

const initialState: FavoritesState = {
  games: loadFavorites(),
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    addFavorite: (state, action: PayloadAction<Game>) => {
      const exists = state.games.some(
        (game) => game.id === action.payload.id
      );

      if (!exists) {
        state.games.push(action.payload);
      }
    },

    removeFavorite: (state, action: PayloadAction<number>) => {
      state.games = state.games.filter(
        (game) => game.id !== action.payload
      );
    },
  },
});

export const { addFavorite, removeFavorite } =
  favoritesSlice.actions;

export default favoritesSlice.reducer;
