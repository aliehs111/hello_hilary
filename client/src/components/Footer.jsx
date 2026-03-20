import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full border-t border-pink-100 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col items-center gap-3 text-sm text-gray-500 sm:flex-row sm:justify-between">
        <div>© {new Date().getFullYear()} Hello Hilary</div>
        <div className="text-center">
          Made with love especially for Hilary 💕
        </div>
        <Link
          to="/admin"
          className="text-gray-400 hover:text-pink-600 text-lg transition"
          title="Admin"
        >
          ⚙️
        </Link>
      </div>
    </footer>
  );
}
