"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <Image src="/logo.svg" alt="Voxora Logo" width={24} height={24} />
          <h2 style={{ margin: 0, fontSize: "1.25rem" }}>Voxora Admin</h2>
        </div>
        <p>Dashboard</p>
        <p>Leads</p>
        <p>Analytics</p>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "20px" }}>{children}</div>
    </div>
  );
}
