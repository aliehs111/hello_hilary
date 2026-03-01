// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import SignIn from "./pages/SignIn";
import Upload from "./pages/Upload";
import About from "./pages/About"; // ← New
import Hilary from "./pages/Hilary"; // ← New
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/about" element={<About />} />
          <Route path="/hilary" element={<Hilary />} />

          {/* 404 fallback */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center text-center pt-20 px-6">
                <div>
                  <h1 className="text-5xl font-bold text-pink-800 mb-6">
                    Oops! Page Not Found
                  </h1>
                  <p className="text-xl text-gray-600 mb-10 max-w-md mx-auto">
                    The page you're looking for doesn't exist or has been moved.
                  </p>
                  <Link
                    to="/"
                    className="inline-block bg-pink-500 text-white text-lg font-semibold py-4 px-10 rounded-full shadow-lg hover:bg-pink-600 transition focus:outline-none focus:ring-4 focus:ring-pink-300"
                  >
                    Back to Home 💕
                  </Link>
                </div>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
