"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function MovieDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const movieId = searchParams.get("id");
  const [movie, setMovie] = useState<any>(null);
  const [rating, setRating] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!movieId) return;
    fetch(`${API_URL}/movies/${movieId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => setMovie(data))
      .catch(() => setError("Failed to load movie details."))
      .finally(() => setLoading(false));
    // Fetch userId for rating
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
        .then((data) => {
          if (data && data.id) setUserId(data.id.toString());
        });
    }
  }, [movieId]);

  const handleRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("You must be logged in to rate.");
      if (!userId) throw new Error("User ID not found.");
      const res = await fetch(`${API_URL}/ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          movie_id: movieId,
          rating: Number(rating),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to rate movie");
      setSuccess("Rating submitted!");
      setRating("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center text-red-600">
        {error}
      </div>
    );
  if (!movie) return null;

  return (
    <main className="flex min-h-screen justify-center pt-12">
      <div className="w-full max-w-xl p-8 bg-white rounded shadow flex flex-col md:flex-row gap-8">
        {movie.poster_url && (
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="w-40 h-60 object-cover rounded border border-gray-200 shadow-md mx-auto md:mx-0"
          />
        )}
        <div className="flex-1 flex flex-col">
          <h1 className="text-3xl font-bold mb-2 text-blue-700">
            {movie.title}{" "}
            <span className="text-lg text-gray-500">({movie.year})</span>
          </h1>
          <div className="mb-2 text-gray-700">Genre: {movie.genre}</div>
          <div className="mb-2 text-gray-700">Director: {movie.director}</div>
          <div className="mb-2 text-gray-700">{movie.description}</div>
          <form onSubmit={handleRate} className="mt-4 flex gap-2 items-center">
            <input
              type="number"
              min="1"
              max="10"
              step="1"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Rate 1-5"
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition"
            >
              Rate
            </button>
          </form>
          {error && <div className="text-red-500 mt-2">{error}</div>}
          {success && <div className="text-green-600 mt-2">{success}</div>}
        </div>
      </div>
    </main>
  );
}
