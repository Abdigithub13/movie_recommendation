"use client";
import { useRouter, usePathname } from "next/navigation";
import { FiMenu, FiHome, FiSearch, FiUser, FiLogOut } from "react-icons/fi";

const navLinks = [
  { href: "/profile", label: "Profile", icon: <FiUser /> },
  { href: "/", label: "Home", icon: <FiHome /> },
  { href: "/search", label: "Search", icon: <FiSearch /> },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <aside className="h-screen w-56 bg-white border-r border-gray-200 flex flex-col py-8 px-4 shadow-lg">
      <nav className="flex-1 flex flex-col gap-2">
        {navLinks.map((link) => (
          <button
            key={link.href}
            onClick={() => router.push(link.href)}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium transition hover:bg-blue-50 ${
              pathname === link.href
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700"
            }`}
          >
            <span className="text-xl">{link.icon}</span>
            {link.label}
          </button>
        ))}
      </nav>
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition mt-8"
      >
        <FiLogOut className="text-xl" /> Logout
      </button>
    </aside>
  );
}
