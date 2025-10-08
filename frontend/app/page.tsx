"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export default function HomePage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }
      fetch(`${API_URL}/recommendations`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
        .then((data) => {
          // Accept { recommended: [...] }, { recommendations: [...] }, or array
          if (Array.isArray(data)) {
            setRecommendations(data);
          } else if (data && Array.isArray(data.recommendations)) {
            setRecommendations(data.recommendations);
          } else if (data && Array.isArray(data.recommended)) {
            setRecommendations(data.recommended);
          } else {
            setRecommendations([]);
          }
        })
        .catch(() => setError("Failed to load recommendations."))
        .finally(() => setLoading(false));
    }
  }, [router]);

  if (!isClient) return null;
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
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-2 sm:px-4 md:px-8">
      <div className="w-full max-w-6xl p-2 sm:p-4 md:p-8 bg-white rounded shadow">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 sm:mb-8 text-blue-700 text-center tracking-tight drop-shadow">
          Recommended Movies
        </h1>
        {recommendations.length === 0 ? (
          <div className="text-center text-gray-500">
            No recommendations found.
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {recommendations.map((movie: any) => (
              <li
                key={movie.id}
                className="bg-gray-50 p-3 sm:p-4 rounded-lg shadow flex flex-col items-center border border-gray-100 hover:shadow-lg transition min-h-[340px]"
              >
                {movie.poster_url && (
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-24 h-36 sm:w-32 sm:h-48 object-cover rounded mb-2 sm:mb-3 shadow-md border border-gray-200"
                  />
                )}
                <span className="text-lg sm:text-xl font-bold mb-1 text-gray-900 text-center leading-tight">
                  {movie.title}{" "}
                  <span className="text-base text-gray-500 font-normal">
                    ({movie.year})
                  </span>
                </span>
                <span className="text-xs sm:text-sm text-gray-600 mb-1 text-center">
                  Genre: {movie.genre}
                </span>
                <span className="text-xs sm:text-sm text-gray-600 mb-1 text-center">
                  Director: {movie.director}
                </span>
                <span className="text-sm sm:text-base text-yellow-600 font-semibold flex items-center justify-center gap-1 mb-2">
                  {movie.rating_count && Number(movie.rating_count) > 0
                    ? Number(movie.avg_rating).toFixed(1)
                    : "N/A"}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    className="w-4 h-4 sm:w-5 sm:h-5 inline-block text-yellow-400"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.196-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
                  </svg>
                </span>
                <p className="text-gray-700 mt-2 text-center text-xs sm:text-sm line-clamp-4">
                  {movie.description}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
