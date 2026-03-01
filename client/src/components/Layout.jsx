// src/components/Layout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar"; // Adjust path if your Navbar is elsewhere

export default function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-blue-50">
      {" "}
      {/* Your warm background here if you want it global */}
      <Navbar />
      <main className="pt-16 md:pt-20">
        {" "}
        {/* Pushes content down below the fixed navbar */}
        <Outlet /> {/* ← This is where Home, Gallery, etc. will appear */}
      </main>
      {/* Optional: Add a footer here later if you want */}
    </div>
  );
}
