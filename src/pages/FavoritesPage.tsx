
import { useSelector } from "react-redux";
import styled from "styled-components";

import GameCard from "../components/GameCard";
import type { RootState } from "../store/store";

// ========================================
// STYLES
// ========================================

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(min(100%, 260px), 1fr)
  );
  gap: 24px;
  margin-top: 30px;
`;

// ========================================
// FAVORITES PAGE
// ========================================

function FavoritesPage() {
  // --------------------------------------
  // REDUX STATE
  // --------------------------------------

  const favorites = useSelector(
    (state: RootState) => state.favorites.games
  );

  // --------------------------------------
  // RENDER
  // --------------------------------------

  return (
    <div>
      {/* PAGE TITLE */}

      <h1>Favorite Games</h1>

      {/* FAVORITE GAMES LIST */}

      {favorites.length === 0 ? (
        <p>You haven't added any games yet.</p>
      ) : (
        <Grid>
          {favorites.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </Grid>
      )}
    </div>
  );
}

export default FavoritesPage;
