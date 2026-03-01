// src/pages/NotFound.jsx
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center pt-20 px-6">
      <div>
        <h1 className="text-5xl md:text-6xl font-bold text-pink-800 mb-6">
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
  );
}
