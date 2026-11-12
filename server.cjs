
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors({
  origin: "http://localhost:5173",
}));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "Steam Client API server is running",
  });
});

// Поиск игр
app.get("/api/games/search", async (req, res) => {
  const query = String(req.query.q || "").trim();

  if (!query) {
    return res.status(400).json({
      error: "Game name is required",
    });
  }

  if (!process.env.RAPIDAPI_KEY || !process.env.RAPIDAPI_HOST) {
    return res.status(500).json({
      error: "RapidAPI configuration is missing",
    });
  }

  try {
    const url = new URL(
      `https://${process.env.RAPIDAPI_HOST}/search`
    );

    url.searchParams.set("sugg", query);

    const response = await fetch(url, {
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": process.env.RAPIDAPI_HOST,
      },
    });

    if (!response.ok) {
      return res.status(502).json({
        error: "RapidAPI request failed",
        upstreamStatus: response.status,
      });
    }

    const result = await response.json();

    if (result.status !== 200) {
      return res.status(502).json({
        error: result.message || "RapidAPI returned an error",
      });
    }

    const games = (result.data?.search || []).map((game) => {
      const rawPrice = String(game.price ?? "");

      const price =
        rawPrice.toLowerCase() === "free"
          ? 0
          : /^\$?\d+(\.\d+)?$/.test(rawPrice)
            ? Number(rawPrice.replace("$", ""))
            : undefined;

      return {
        id: Number(game.id),
        name: game.name,
        image: game.image,
        price,
      };
    });

    res.json({ games });
  } catch (error) {
    console.error("Game search error:", error);

    res.status(500).json({
      error: "Failed to search games",
    });
  }
});


 // Каталог игр с пагинацией
app.get("/api/games/page/:page", async (req, res) => {
  const page = Number(req.params.page);

  if (!Number.isInteger(page) || page < 1) {
    return res.status(400).json({
      error: "Invalid page number",
    });
  }

  if (!process.env.RAPIDAPI_KEY || !process.env.RAPIDAPI_HOST) {
    return res.status(500).json({
      error: "RapidAPI configuration is missing",
    });
  }

  try {
    const url = new URL(
      `https://${process.env.RAPIDAPI_HOST}/page/${page}`
    );

    const response = await fetch(url, {
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": process.env.RAPIDAPI_HOST,
      },
    });

    if (!response.ok) {
      return res.status(502).json({
        error: "Failed to load catalog",
      });
    }

    const result = await response.json();

    if (result.status !== 200) {
      return res.status(502).json({
        error: result.message || "API returned an error",
      });
    }

    const games = (result.data?.pages || []).map((game) => {
      const rawPrice = String(game.price ?? "");

      const price =
        rawPrice.toLowerCase() === "free"
          ? 0
          : /^\$?\d+(\.\d+)?$/.test(rawPrice)
            ? Number(rawPrice.replace("$", ""))
            : undefined;

      return {
        id: Number(game.id),
        name: game.name,
        image: game.img,
        price,
        releaseDate: game.release_date,
      };
    });

    res.json({
      games,
      currentPage: result.data?.current_page ?? page,
      totalPages: result.data?.total_page ?? 1,
    });
  } catch (error) {
    console.error("Catalog error:", error);

    res.status(500).json({
      error: "Failed to load catalog",
    });
  }
});


// Подробная информация об игре
app.get("/api/games/:id", async (req, res) => {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({
      error: "Invalid game ID",
    });
  }

  if (!process.env.RAPIDAPI_KEY || !process.env.RAPIDAPI_HOST) {
    return res.status(500).json({
      error: "RapidAPI configuration is missing",
    });
  }

  try {
    const url = new URL(
      `https://${process.env.RAPIDAPI_HOST}/gameinfo/single_game/${id}`
    );

    const response = await fetch(url, {
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": process.env.RAPIDAPI_HOST,
      },
    });

    if (!response.ok) {
      return res.status(502).json({
        error: "Failed to fetch game details",
        upstreamStatus: response.status,
      });
    }

    const result = await response.json();

    if (result.status !== 200) {
      return res.status(502).json({
        error: result.message || "RapidAPI returned an error",
      });
    }

    res.json({
      game: result.data,
    });
  } catch (error) {
    console.error("Game details error:", error);

    res.status(500).json({
      error: "Failed to load game details",
    });
  }
});

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
