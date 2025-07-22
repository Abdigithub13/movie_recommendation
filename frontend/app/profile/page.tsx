"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    fetch(`${API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          console.error("Profile fetch failed:", res.status, text);
          throw new Error("Profile fetch failed");
        }
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        if (data && data.id) setUserId(data.id.toString());
      })
      .catch((err) => {
        setError("Failed to load profile. Please log in again.");
        localStorage.removeItem("token");
        router.replace("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

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
  if (!profile) return null;

  return (
    <main className="min-h-screen w-full bg-white flex flex-col px-2 sm:px-4 md:px-8">
      <div className="w-full py-6 sm:py-8 flex flex-col flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-4 sm:mb-6 text-center md:text-left">
          Ratings History
        </h1>
        {profile.preferences && (
          <div className="mb-6 sm:mb-8 max-w-2xl mx-auto">
            <div className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
              Preferences:
            </div>
            <pre className="bg-gray-100 p-2 rounded text-xs sm:text-sm text-gray-700">
              {JSON.stringify(profile.preferences, null, 2)}
            </pre>
          </div>
        )}
        {profile.ratings && profile.ratings.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-7xl mx-auto">
            {profile.ratings.map((r: any) => (
              <li
                key={r.id}
                className="bg-gray-50 p-3 sm:p-4 rounded-lg flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 shadow border border-gray-100 hover:shadow-lg transition min-h-[160px]"
              >
                {r.poster_url && (
                  <img
                    src={r.poster_url}
                    alt={r.title}
                    className="w-16 h-24 sm:w-20 sm:h-28 object-cover rounded border border-gray-200 shadow-sm"
                  />
                )}
                <div className="flex-1">
                  <span className="block font-semibold text-gray-900 text-base sm:text-lg">
                    {r.title} ({r.year})
                  </span>
                  <span className="block text-xs sm:text-sm text-gray-600">
                    Rating: {r.rating ? r.rating + " ⭐" : "Not rated"}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {new Date(r.timestamp).toLocaleString()}
                  </span>
                  <button
                    className="mt-2 text-blue-600 hover:underline text-xs sm:text-sm"
                    onClick={() => router.push(`/movie?id=${r.movie_id}`)}
                  >
                    View Details / Rate
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-500 text-center mt-12 sm:mt-16 text-base sm:text-lg">
            No ratings yet. Rate some movies to see your history here!
          </div>
        )}
      </div>
    </main>
  );
}
