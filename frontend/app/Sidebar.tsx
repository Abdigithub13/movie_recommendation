"use client";

import { useRouter, usePathname } from "next/navigation";
import { FiMenu, FiHome, FiSearch, FiUser, FiLogOut } from "react-icons/fi";
import { useState } from "react";

const navLinks = [
  { href: "/profile", label: "Profile", icon: <FiUser /> },
  { href: "/", label: "Home", icon: <FiHome /> },
  { href: "/search", label: "Search", icon: <FiSearch /> },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
    setOpen(false);
  };

  // Sidebar content as a component for reuse
  const SidebarContent = (
    <div className="h-full flex flex-col">
      <nav className="flex-1 flex flex-col gap-2 mt-8 sm:mt-0">
        {navLinks.map((link) => (
          <button
            key={link.href}
            onClick={() => {
              router.push(link.href);
              setOpen(false);
            }}
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
    </div>
  );

  return (
    <>
      {!open && (
        <button
          className="fixed top-4 left-4 z-50 bg-white border border-gray-200 rounded-full p-2 shadow-lg"
          onClick={() => setOpen(true)}
          aria-label="Open sidebar"
        >
          <FiMenu className="text-2xl text-blue-700" />
        </button>
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col py-8 px-4 shadow-lg z-50 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ pointerEvents: open ? "auto" : "none" }}
        aria-hidden={!open}
      >
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        >
          &times;
        </button>
        {SidebarContent}
      </aside>
    </>
  );
}
