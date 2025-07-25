"use client";
import { FiMenu } from "react-icons/fi";
import { useEffect, useState } from "react";

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const [profile, setProfile] = useState<any>(null);
  const getProfilePicUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("/uploads/")) {
      return `http://localhost:5000${url}`;
    }
    return url;
  };
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const API_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    fetch(API_URL + "/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          console.error("Header profile fetch failed:", res.status, text);
          throw new Error("Profile fetch failed");
        }
        return res.json();
      })
      .then((data) => {
        // console.log("Header Profile API response:", data); // Debug log
        setProfile(data);
      });
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <header className="w-full h-16 flex items-center px-6 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
      <button
        className="mr-4 text-black p-2 rounded hover:bg-blue-50"
        onClick={onMenuClick}
        aria-label="Toggle sidebar"
      >
        <FiMenu className="text-2xl" />
      </button>
      <span className="font-bold text-blue-700 flex-1">
        Movie Recommendation
      </span>
      <div className="ml-auto flex items-center relative z-30">
        <button
          className="focus:outline-none cursor-pointer"
          type="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            setShowProfileModal(true);
          }}
          aria-label="Show profile"
        >
          {profile && profile.profile_picture ? (
            <img
              src={getProfilePicUrl(profile.profile_picture)}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-500 shadow"
              style={{ pointerEvents: "none" }}
            />
          ) : profile && profile.username ? (
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg border-2 border-blue-500 shadow select-none">
              {getInitials(profile.username)}
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg border-2 border-gray-300 shadow select-none">
              ?
            </div>
          )}
        </button>
        {showProfileModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={() => setShowProfileModal(false)}
          >
            <div
              className="bg-white rounded-xl shadow-xl p-8 relative min-w-[380px] max-w-[440px] w-full overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
                onClick={() => setShowProfileModal(false)}
                type="button"
                aria-label="Close profile modal"
              >
                &times;
              </button>
              <div className="flex flex-col items-center gap-3">
                <div className="text-xl font-bold text-blue-700 mb-1">
                  Your Profile
                </div>
                {profile && profile.profile_picture ? (
                  <img
                    src={getProfilePicUrl(profile.profile_picture)}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl border-2 border-blue-500 shadow">
                    {profile ? getInitials(profile.username) : "?"}
                  </div>
                )}
                <div className="w-full text-center mt-2">
                  <div className="text-sm text-gray-800">
                    Username:{" "}
                    {profile && profile.username ? (
                      profile.username
                    ) : (
                      <span className="text-gray-400">Not available</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Email:{" "}
                    {profile && profile.email ? (
                      profile.email
                    ) : (
                      <span className="text-gray-400">Not available</span>
                    )}
                  </div>
                  {profile && profile.full_name && (
                    <div className="text-sm text-gray-600">
                      Name: {profile.full_name}
                    </div>
                  )}
                  {profile && profile.created_at && (
                    <div className="text-xs text-gray-400 mt-1">
                      Joined:{" "}
                      {new Date(profile.created_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <form
                  className="flex flex-col items-center gap-2 mt-2 w-full"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const fileInput = (e.target as any).elements.profilePic;
                    const file = fileInput.files[0];
                    if (!file) return;
                    setUploading(true);
                    const formData = new FormData();
                    formData.append("profile_picture", file);
                    const token = localStorage.getItem("token");
                    const API_URL =
                      process.env.NEXT_PUBLIC_API_URL ||
                      "http://localhost:5000/api";
                    try {
                      const uploadRes = await fetch(
                        API_URL + "/profile/picture",
                        {
                          method: "POST",
                          body: formData,
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      );
                      const uploadText = await uploadRes.text();
                      console.log(
                        "Profile picture upload response:",
                        uploadRes.status,
                        uploadText
                      );
                      if (!uploadRes.ok) {
                        alert(
                          "Failed to upload profile picture: " + uploadText
                        );
                        setUploading(false);
                        return;
                      }
                      const res = await fetch(API_URL + "/profile", {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      if (!res.ok) {
                        const text = await res.text();
                        alert("Profile fetch failed: " + text);
                        setUploading(false);
                        return;
                      }
                      const data = await res.json();
                      setProfile(data);
                      setShowProfileModal(false);
                    } catch (err) {
                      alert(
                        "An error occurred while uploading profile picture."
                      );
                      console.error(err);
                    } finally {
                      setUploading(false);
                    }
                  }}
                >
                  <label
                    className="block text-xs font-medium text-gray-700 mb-1"
                    htmlFor="profilePic"
                  >
                    Change Profile Picture
                  </label>
                  <input
                    type="file"
                    name="profilePic"
                    id="profilePic"
                    accept="image/*"
                    required
                    className="block w-full text-xs text-gray-600"
                    disabled={uploading}
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition mt-1 w-full text-sm"
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
