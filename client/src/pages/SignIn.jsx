// src/pages/SignIn.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: secretCode }),
      });

      const data = await res.json();

      if (res.ok) {
        // Session is set via cookie from backend
        navigate("/gallery"); // or '/upload' or home – your choice
      } else {
        setError(data.message || "Invalid email or code. Please try again.");
      }
    } catch (err) {
      setError("Connection issue — please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-6 bg-gradient-to-b from-pink-50 to-blue-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl md:text-4xl font-bold text-pink-800 mb-6 text-center">
          Hello Hilary Login 💕
        </h1>

        <p className="text-gray-700 mb-8 text-center text-lg">
          Enter the email to which your invitation was sent and the security
          code provided in that email invitation.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Your Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
            />
          </div>

          {/* Secret code field */}
          <div>
            <label
              htmlFor="secretCode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Security Code
            </label>
            <input
              id="secretCode"
              type="password"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 text-white py-3 rounded-lg font-semibold text-lg hover:bg-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Checking..." : "Log In"}
          </button>
        </form>

        {error && (
          <p className="mt-6 text-center text-red-600 font-medium">{error}</p>
        )}

        <p className="mt-8 text-center text-sm text-gray-500">
          First time? Just enter your email and the code — you'll be added
          automatically if approved.
        </p>
      </div>
    </div>
  );
}
