"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const res1 = await fetch("/api/dashboard/stats", {
  credentials: "include",
});
      const statsData = await res1.json();
      setStats(statsData);

      const res2 = await fetch("/api/dashboard/contacts", {
  credentials: "include",
});
      const contactData = await res2.json();
      setContacts(contactData);
    }

    fetchData();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>

      <div style={{ marginBottom: 20 }}>
        <h2>Total Leads: {stats?.totalLeads ?? 0}</h2>
      </div>

      <h2>Recent Contacts</h2>

      {!contacts ? (
        <p>Loading contacts...</p>
      ) : contacts.length === 0 ? (
        <p>No contacts found</p>
      ) : (
        contacts.map((c) => (
          <div key={c._id}>
            <p><b>Name:</b> {c.name}</p>
            <p><b>Email:</b> {c.email}</p>
            <p><b>Message:</b> {c.message}</p>
          </div>
        ))
      )}
    </div>
  );
}
