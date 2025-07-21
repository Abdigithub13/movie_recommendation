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
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        setProfile(data);
        if (data && data.id) setUserId(data.id.toString());
      })
      .catch(() => {
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
    <main className="flex min-h-screen">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-lg p-6 bg-white rounded shadow">
          {/* <h1 className="text-3xl font-extrabold mb-6 text-blue-700">
            Profile
          </h1> */}
          {/* Profile info removed, now shown in header modal */}
          {profile.preferences && (
            <div className="mb-6">
              <div className="text-lg font-semibold text-gray-800 mb-1">
                Preferences:
              </div>
              <pre className="bg-gray-100 p-2 rounded text-sm text-gray-700">
                {JSON.stringify(profile.preferences, null, 2)}
              </pre>
            </div>
          )}
          {profile.ratings && profile.ratings.length > 0 ? (
            <div>
              <div className="text-lg font-semibold text-blue-700 mb-2">
                Ratings History:
              </div>
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {profile.ratings.map((r: any) => (
                  <li
                    key={r.id}
                    className="bg-gray-50 p-2 rounded flex flex-col md:flex-row md:items-center gap-2"
                  >
                    {r.poster_url && (
                      <img
                        src={r.poster_url}
                        alt={r.title}
                        className="w-12 h-16 object-cover rounded border border-gray-200 shadow-sm"
                      />
                    )}
                    <div className="flex-1">
                      <span className="block font-semibold text-gray-900">
                        {r.title} ({r.year})
                      </span>
                      <span className="block text-sm text-gray-600">
                        Rating: {r.rating ? r.rating + " ⭐" : "Not rated"}
                      </span>
                      <span className="block text-xs text-gray-500">
                        {new Date(r.timestamp).toLocaleString()}
                      </span>
                      <button
                        className="mt-2 text-blue-600 hover:underline text-sm"
                        onClick={() => router.push(`/movie?id=${r.movie_id}`)}
                      >
                        View Details / Rate
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-gray-500 text-center mt-8">
              No ratings yet. Rate some movies to see your history here!
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
