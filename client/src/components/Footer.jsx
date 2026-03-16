import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full border-t border-pink-100 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between text-sm text-gray-500">
        <div>© {new Date().getFullYear()} Hello Hilary</div>

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
