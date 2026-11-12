
import styled from "styled-components";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import type { Game } from "../types/game";
import type { RootState } from "../store/store";
import {
  addFavorite,
  removeFavorite,
} from "../store/favoritesSlice";

interface GameCardProps {
  game: Game;
}

const Card = styled.article`
  background: #1b2838;
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
`;

const GameLink = styled(Link)`
  display: block;
  color: inherit;
  text-decoration: none;

  &:hover h3 {
    color: #66c0f4;
  }
`; 

const GameImage = styled.img`
  width: 100%;
  height: 170px;
  object-fit: cover;
`;

const Content = styled.div`
  padding: 16px;
`;

const GameTitle = styled.h3`
  color: white;
  margin: 0 0 12px;
`;

const Price = styled.p`
  color: #a4d007;
  font-size: 18px;
`;

const FavoriteButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #2a475e;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 14px;
  cursor: pointer;

  &:hover {
    background: #38658a;
  }
`;

function GameCard({ game }: GameCardProps) {
  const dispatch = useDispatch();

  const isFavorite = useSelector(
    (state: RootState) =>
      state.favorites.games.some(
        (item) => item.id === game.id
      )
  );

  const handleFavorite = () => {
    if (isFavorite) {
      dispatch(removeFavorite(game.id));
    } else {
      dispatch(addFavorite(game));
    }
  };

  return (
  <Card>
    <GameLink
  to={`/game/${game.id}`}
  state={{ image: game.image }}
>
      <GameImage
        src={game.image || "https://placehold.co/460x215"}
        alt={game.name}
      />
    </GameLink>

    <Content>
      <GameLink
  to={`/game/${game.id}`}
  state={{ image: game.image }}
>
        <GameTitle>{game.name}</GameTitle>
      </GameLink>

<Price>
  {game.price === 0
    ? "Free"
    : game.price !== undefined
      ? `$${game.price.toFixed(2)}`
      : "Price unavailable"}
</Price>

<p style={{ color: "#c7d5e0", fontSize: "14px" }}>
  <strong>Release Date:</strong>{" "}
  {game.releaseDate || "Not available"}
</p>

        <FavoriteButton
          type="button"
          onClick={handleFavorite}
        >
          <Heart
            size={18}
            fill={isFavorite ? "#ff4d6d" : "none"}
            color={isFavorite ? "#ff4d6d" : "white"}
          />

          {isFavorite
            ? "Remove from Favorites"
            : "Add to Favorites"}
        </FavoriteButton>
      </Content>
    </Card>
  );
}

export default GameCard;
