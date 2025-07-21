"use client";
import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const handleMenuClick = () => setSidebarOpen((open) => !open);

  return (
    <div className="min-h-screen bg-gray-50 antialiased">
      <Header onMenuClick={handleMenuClick} />
      <div className="flex">
        {sidebarOpen && <Sidebar />}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
