"use client";
import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 antialiased">
      {/* Header can optionally receive onMenuClick if needed for mobile */}
      <Header />
      <div className="flex">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 p-8 transition-all duration-300 sm:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
}
