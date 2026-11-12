
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import styled from "styled-components";

// ========================================
// TYPES
// ========================================

type NamedValue = {
  Value?: string;
};

type GameDetails = {
  dev_details?: {
    developer_name?: string[];
    publisher?: string[];
  };
  name?: string;
  desc?: string;
  about_game?: string;
  pricing?: Array<{
    discount?: string;
    originalPrice?: string;
    discountPrice?: string;
  }>;
  tags?: string[];
  developer_name?: NamedValue | string | string[];
  publisher?: NamedValue | string | string[];
  media?: {
    screenshot?: string[];
    videos?: unknown[];
  };
  sys_req?: {
    window?: {
      min?: string;
      recom?: string;
    };
  };
};

// ========================================
// STYLES
// ========================================

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const BackLink = styled(Link)`
  color: #66c0f4;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const Title = styled.h1`
  color: #ffffff;
  font-size: 32px;
  margin: 0;
`;

const GameHeader = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
  gap: 24px;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.section`
  background: #1b2838;
  padding: 24px;
  border-radius: 8px;
`;

const SectionTitle = styled.h2`
  color: #ffffff;
  font-size: 22px;
  margin-top: 0;
`;

const ScreenshotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(220px, 1fr)
  );
  gap: 16px;
`;

const Screenshot = styled.img`
  width: 100%;
  border-radius: 6px;
  object-fit: cover;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Tag = styled.span`
  background: #2a475e;
  color: #c7d5e0;
  padding: 7px 12px;
  border-radius: 4px;
`;

// ========================================
// HELPER FUNCTIONS
// ========================================

// Format developer and publisher names
function formatName(value: unknown): string {
  if (typeof value === "string") {
    return value.trim() || "Unknown";
  }

  if (Array.isArray(value)) {
    const names = value
      .map((item) => formatName(item))
      .filter((name) => name !== "Unknown");

    return names.join(", ") || "Unknown";
  }

  if (value && typeof value === "object") {
    const data = value as Record<string, unknown>;

    return formatName(
      data.Value ??
        data.value ??
        data.name ??
        data.developer_name ??
        data.publisher_name
    );
  }

  return "Unknown";
}

// Format game price
function formatPrice(
  pricing?: GameDetails["pricing"]
): string {
  const price = pricing?.[0];

  if (!price) {
    return "Not available";
  }

  const value =
    price.discountPrice || price.originalPrice;

  if (!value) {
    return "Not available";
  }

  if (
    value.toLowerCase() === "free" ||
    value === "0" ||
    value === "0%"
  ) {
    return "Free";
  }

  return value;
}

// ========================================
// GAME DETAILS PAGE
// ========================================

function GameDetailsPage() {
  // --------------------------------------
  // ROUTER
  // --------------------------------------

  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const imageFromCatalog = (
    location.state as { image?: string } | null
  )?.image;

  // --------------------------------------
  // STATE
  // --------------------------------------

  const [game, setGame] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAllTags, setShowAllTags] = useState(false);

  // --------------------------------------
  // LOAD GAME DETAILS
  // --------------------------------------

  useEffect(() => {
    if (!id) {
      setError("Game ID is missing");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadGame() {
      setLoading(true);
      setError("");
      setGame(null);

      try {
        const response = await fetch(
          `http://localhost:3001/api/games/${id}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to load game");
        }

        const result = await response.json();

        console.log("FULL GAME DATA:", result.game);
        console.log(
          "DEVELOPER:",
          result.game?.developer_name
        );
        console.log(
          "PUBLISHER:",
          result.game?.publisher
        );

        setGame(result.game);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unknown error"
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadGame();

    return () => controller.abort();
  }, [id]);

  // --------------------------------------
  // LOADING AND ERROR STATES
  // --------------------------------------

  if (loading) {
    return <p>Loading game details...</p>;
  }

  if (error) {
    return <p style={{ color: "#ff6b6b" }}>{error}</p>;
  }

  if (!game) {
    return <p>Game not found.</p>;
  }

  // --------------------------------------
  // GAME DATA
  // --------------------------------------

  const screenshots = game.media?.screenshot ?? [];

  // --------------------------------------
  // RENDER
  // --------------------------------------

  return (
    <Page>
      {/* BACK TO STORE */}

      <BackLink to="/">← Back to Store</BackLink>

      {/* GAME TITLE */}

      <Title>{game.name}</Title>

      {/* GAME HEADER */}

      <GameHeader>
        {/* GAME COVER */}

        <img
          src={
            imageFromCatalog ||
            `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${id}/header.jpg`
          }
          alt={game.name || "Game cover"}
          style={{
            width: "100%",
            maxWidth: "900px",
            borderRadius: "8px",
            objectFit: "cover",
            display: "block",
          }}
        />

        {/* GAME INFORMATION */}

        <Section>
          <SectionTitle>Game Information</SectionTitle>

          <p>
            <strong>Price:</strong>{" "}
            {formatPrice(game.pricing)}
          </p>

          <p>
            <strong>Developer:</strong>{" "}
            {formatName(game.dev_details?.developer_name)}
          </p>

          <p>
            <strong>Publisher:</strong>{" "}
            {formatName(game.dev_details?.publisher)}
          </p>

          {/* GAME TAGS */}

          {game.tags && game.tags.length > 0 && (
            <div>
              <Tags>
                {(showAllTags
                  ? game.tags
                  : game.tags.slice(0, 6)
                ).map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Tags>

              {/* SHOW MORE / SHOW LESS */}

              {game.tags.length > 6 && (
                <button
                  type="button"
                  onClick={() =>
                    setShowAllTags(!showAllTags)
                  }
                  style={{
                    marginTop: "12px",
                    padding: "8px 14px",
                    background: "#2a475e",
                    color: "#66c0f4",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  {showAllTags
                    ? "Show Less"
                    : "Show More"}
                </button>
              )}
            </div>
          )}
        </Section>
      </GameHeader>

      {/* SCREENSHOTS */}

      {screenshots.length > 0 && (
        <Section>
          <SectionTitle>Screenshots</SectionTitle>

          <ScreenshotGrid>
            {screenshots.map((image, index) => (
              <Screenshot
                key={index}
                src={image}
                alt={`${game.name} screenshot ${index + 1}`}
                loading="lazy"
              />
            ))}
          </ScreenshotGrid>
        </Section>
      )}

      {/* ABOUT THIS GAME */}

      <Section>
        <SectionTitle>About This Game</SectionTitle>

        <p
          style={{
            whiteSpace: "pre-line",
            lineHeight: 1.7,
          }}
        >
          {game.about_game ||
            game.desc ||
            "No description available."}
        </p>
      </Section>

      {/* SYSTEM REQUIREMENTS */}

      {game.sys_req?.window && (
        <Section>
          <SectionTitle>System Requirements</SectionTitle>

          <h3>Minimum</h3>
          <p style={{ whiteSpace: "pre-line" }}>
            {game.sys_req.window.min || "Not available"}
          </p>

          <h3>Recommended</h3>
          <p style={{ whiteSpace: "pre-line" }}>
            {game.sys_req.window.recom || "Not available"}
          </p>
        </Section>
      )}
    </Page>
  );
}

export default GameDetailsPage;
