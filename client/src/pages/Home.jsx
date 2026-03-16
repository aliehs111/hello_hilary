import { Link } from "react-router-dom";
import hilaryPhoto from "../assets/hilary.jpg";

const primaryLinkClass =
  "heart-button inline-flex items-center justify-center rounded-full bg-purple-500 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:-translate-y-1 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-300";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 to-blue-50 px-6 py-10">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center text-center">
        <img
          src={hilaryPhoto}
          alt="Hilary smiling"
          className="mb-6 h-48 w-48 rounded-full border-4 border-pink-200 object-cover shadow-xl md:h-64 md:w-64"
          loading="lazy"
        />

        <h1 className="mb-4 text-5xl font-bold text-pink-800 md:text-7xl">
          Hello Hilary 💕
        </h1>

        <p className="mb-10 max-w-2xl text-xl leading-relaxed text-gray-700 md:text-3xl">
          Upload videos for Hilary to watch in the gallery, and visit Hilary’s
          page to see her latest videos and photos.
        </p>

        <div className="grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
          <Link to="/hilary" className={primaryLinkClass}>
            ❤️ Hilary&apos;s Page
          </Link>

          <Link to="/gallery" className={primaryLinkClass}>
            🎥 Watch Videos
          </Link>

          <Link to="/upload" className={primaryLinkClass}>
            💌 Send Hilary a Hello
          </Link>
        </div>

        <Link
          to="/signin"
          className="mt-8 text-lg font-medium text-blue-600 transition hover:underline"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
