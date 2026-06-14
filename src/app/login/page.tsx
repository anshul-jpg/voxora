"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
  console.log("EMAIL:", email);
  console.log("PASSWORD:", password);

  if (!email || !password) {
    alert("Email and password required");
    return;
  }

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  console.log("RESPONSE:", data);

  if (data.success) {
    router.push("/dashboard");
  } else {
    alert(data.message || "Login failed");
  }
}; return (
    <div style={{ padding: 50 }}>
      <h1>Login</h1>

      <input
  placeholder="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

<br />

<input
  placeholder="password"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>      <br />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
