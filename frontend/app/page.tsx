"use client";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function HomePage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_URL}/recommendations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (Array.isArray(data)) {
          setRecommendations(data);
        } else if (data && Array.isArray(data.recommendations)) {
          setRecommendations(data.recommendations);
        } else {
          setRecommendations([]);
        }
      })
      .catch(() => setError("Failed to load recommendations."))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading recommendations...
      </div>
    );
  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center text-red-600">
        {error}
      </div>
    );

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-3xl p-8 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-6">Recommended Movies</h1>
        {recommendations.length === 0 ? (
          <div>No recommendations found.</div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((movie: any) => (
              <li
                key={movie.id}
                className="bg-gray-50 p-4 rounded shadow flex flex-col"
              >
                <span className="text-lg font-semibold mb-1">
                  {movie.title} ({movie.year})
                </span>
                <span className="text-sm text-gray-600 mb-2">
                  Genre: {movie.genre}
                </span>
                <span className="text-sm text-gray-600 mb-2">
                  Director: {movie.director}
                </span>
                <span className="text-sm text-gray-600 mb-2">
                  Rating:{" "}
                  {movie.avg_rating ? movie.avg_rating.toFixed(1) : "N/A"} ⭐
                </span>
                <p className="text-gray-700 mt-2">{movie.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
