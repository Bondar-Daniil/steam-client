
import type { Game } from "../types/game";

export type SortBy = "price" | "date";
export type SortOrder = "asc" | "desc";

export function sortGames(
  games: Game[],
  sortBy: SortBy,
  sortOrder: SortOrder
): Game[] {
  return [...games].sort((a, b) => {
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

    // Games without a value go to the end
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
}
