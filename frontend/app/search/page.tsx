"use client";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch(
        `${API_URL}/movies/search?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen justify-center pt-8">
      <div className="w-full max-w-2xl p-8 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-6">Search Movies</h1>
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Search by title, genre, etc."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {results.length > 0 && (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((movie: any) => (
              <li
                key={movie.id}
                className="bg-gray-50 p-4 rounded shadow flex flex-col items-center"
              >
                {movie.poster_url && (
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-32 h-48 object-cover rounded mb-3 shadow-md border border-gray-200"
                  />
                )}
                <span className="text-lg font-bold mb-1 text-gray-900 text-center">
                  {movie.title} ({movie.year})
                </span>
                <span className="text-sm text-gray-600 mb-2 text-center">
                  Genre: {movie.genre}
                </span>
                <span className="text-sm text-gray-600 mb-2 text-center">
                  Director: {movie.director}
                </span>
                <span className="text-sm text-gray-600 mb-2 text-center">
                  Rating:{" "}
                  {movie.avg_rating ? movie.avg_rating.toFixed(1) : "N/A"} ⭐
                </span>
                <p className="text-gray-700 mt-2 text-center">
                  {movie.description}
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 text-sm"
                    onClick={() =>
                      (window.location.href = `/movie?id=${movie.id}`)
                    }
                  >
                    View Details / Rate
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
