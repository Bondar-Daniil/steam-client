
import { useEffect, useState } from "react";
import styled from "styled-components";

import GameCard from "../components/GameCard";
import type { Game } from "../types/game";

// ========================================
// TYPES
// ========================================

type SortBy = "price" | "date";
type SortOrder = "asc" | "desc";

type CatalogResponse = {
  games: Game[];
  currentPage: number;
  totalPages: number;
};

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

const SearchForm = styled.form`
  display: flex;
  gap: 12px;
  margin-top: 24px;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 14px;
  border-radius: 8px;
  border: 1px solid #2a475e;
  background: #1b2838;
  color: white;
  font-size: 16px;
`;

const Button = styled.button`
  background: #66c0f4;
  color: #101822;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
`;

const Select = styled.select`
  background: #1b2838;
  color: white;
  border: 1px solid #2a475e;
  border-radius: 6px;
  padding: 10px 12px;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 30px;
`;

// ========================================
// HOME PAGE
// ========================================

function HomePage() {
  // --------------------------------------
  // STATE
  // --------------------------------------

  const [query, setQuery] = useState("");
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [mode, setMode] = useState<"catalog" | "search">(
    "catalog"
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [sortBy, setSortBy] = useState<SortBy>("price");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // --------------------------------------
  // LOAD CATALOG
  // --------------------------------------

  useEffect(() => {
    if (mode !== "catalog") return;

    const controller = new AbortController();

    async function loadCatalog() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `http://localhost:3001/api/games/page/${currentPage}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to load catalog");
        }

        const data: CatalogResponse = await response.json();

        if (controller.signal.aborted) return;

        setGames(data.games);
        setTotalPages(data.totalPages);
      } catch (err) {
        if (controller.signal.aborted) return;

        console.error(err);
        setGames([]);
        setError("Could not load catalog.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadCatalog();

    return () => controller.abort();
  }, [mode, currentPage]);

  // --------------------------------------
  // SEARCH GAMES
  // --------------------------------------

  const handleSearch = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const searchTerm = query.trim();
    if (!searchTerm) return;

    setMode("search");
    setLoading(true);
    setError("");
    setGames([]);
    setCurrentPage(1);

    try {
      const response = await fetch(
        `http://localhost:3001/api/games/search?q=${encodeURIComponent(
          searchTerm
        )}`
      );

      if (!response.ok) {
        throw new Error("Failed to search games");
      }

      const data: { games: Game[] } = await response.json();

      setGames(data.games);
    } catch (err) {
      console.error(err);
      setError("Could not search games.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------
  // BACK TO CATALOG
  // --------------------------------------

  const showCatalog = () => {
    setQuery("");
    setGames([]);
    setError("");
    setCurrentPage(1);
    setMode("catalog");
  };

  // --------------------------------------
  // SORT GAMES
  // --------------------------------------

  const sortedGames = [...games].sort((a, b) => {
    let valueA: number | undefined;
    let valueB: number | undefined;

    if (sortBy === "price") {
      valueA = a.price;
      valueB = b.price;
    } else {
      const dateA = a.releaseDate
        ? Date.parse(a.releaseDate)
        : NaN;

      const dateB = b.releaseDate
        ? Date.parse(b.releaseDate)
        : NaN;

      valueA = Number.isNaN(dateA)
        ? undefined
        : dateA;

      valueB = Number.isNaN(dateB)
        ? undefined
        : dateB;
    }

    if (valueA === undefined && valueB === undefined) {
      return 0;
    }

    if (valueA === undefined) return 1;
    if (valueB === undefined) return -1;

    const comparison = valueA - valueB;

    return sortOrder === "asc"
      ? comparison
      : -comparison;
  });

  // --------------------------------------
  // RENDER
  // --------------------------------------

  return (
    <div>
      <h1>Game Store</h1>
      <p>Discover your favorite Steam games!</p>

      {/* SEARCH */}

      <SearchForm onSubmit={handleSearch}>
        <SearchInput
          type="text"
          placeholder="Search Steam games..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Search"}
        </Button>
      </SearchForm>

      {/* BACK TO CATALOG */}

      {mode === "search" && (
        <Controls>
          <Button type="button" onClick={showCatalog}>
            Back to Catalog
          </Button>
        </Controls>
      )}

      {/* SORTING */}

      {games.length > 0 && (
        <Controls>
          <Select
            aria-label="Sort games by"
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value as SortBy)
            }
          >
            <option value="price">Sort by Price</option>
            <option value="date">Sort by Release Date</option>
          </Select>

          <Select
            aria-label="Sort order"
            value={sortOrder}
            onChange={(event) =>
              setSortOrder(event.target.value as SortOrder)
            }
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </Select>
        </Controls>
      )}

      {/* STATUS MESSAGES */}

      {loading && <p>Loading games...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && !error && games.length === 0 && (
        <p>No games found.</p>
      )}

      {/* GAME LIST */}

      {!loading && !error && (
        <>
          <Grid>
            {sortedGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </Grid>

          {/* PAGINATION */}

          {mode === "catalog" && totalPages > 1 && (
            <Pagination>
              <Button
                type="button"
                disabled={currentPage === 1}
                onClick={() => {
                  setGames([]);
                  setCurrentPage((page) => page - 1);
                }}
              >
                Previous
              </Button>

              <span>
                Page {currentPage} of {totalPages}
              </span>

              <Button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => {
                  setGames([]);
                  setCurrentPage((page) => page + 1);
                }}
              >
                Next
              </Button>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}

export default HomePage;
