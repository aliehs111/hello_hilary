import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import RequireAdmin from "./components/RequireAdmin";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import SignIn from "./pages/SignIn";
import Upload from "./pages/Upload";
import About from "./pages/About";
import Hilary from "./pages/Hilary";
import AdminMedia from "./pages/AdminMedia";
import NotFound from "./pages/NotFound";
import Footer from "./components/Footer";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />

            {/* Requires any login */}
            <Route element={<RequireAuth />}>
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/about" element={<About />} />
              <Route path="/hilary" element={<Hilary />} />
            </Route>

            {/* Requires admin role */}
            <Route element={<RequireAdmin />}>
              <Route path="/admin" element={<AdminMedia />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
