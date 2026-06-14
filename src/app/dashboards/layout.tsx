"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    }
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: "250px", padding: "20px", background: "#111", color: "#fff" }}>
        <h2>VoiceFlow Admin</h2>
        <p>Dashboard</p>
        <p>Leads</p>
        <p>Analytics</p>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "20px" }}>{children}</div>
    </div>
  );
}
