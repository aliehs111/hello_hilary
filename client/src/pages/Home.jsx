import { Link, useNavigate } from "react-router-dom";
import hilaryPhoto from "../assets/hilary.jpg";
import FallingHeartsOverlay from "../components/FallingHeartsOverlay";

const primaryLinkClass =
  "heart-button inline-flex items-center justify-center rounded-full bg-purple-500 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:-translate-y-1 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-300";

export default function Home() {
  const navigate = useNavigate();

  const handleNavigate = (path) => (e) => {
    e.preventDefault();

    const button = e.currentTarget;
    button.classList.add("animate-hearts");

    setTimeout(() => {
      navigate(path);
    }, 650);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-pink-50 to-blue-50 px-6 pb-6">
      <FallingHeartsOverlay count={16} />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-start pt-2 text-center sm:justify-center sm:pt-0">
        <img
          src={hilaryPhoto}
          alt="Hilary smiling"
          className="mb-4 h-56 w-56 rounded-full border-4 border-pink-200 object-cover shadow-xl md:h-72 md:w-72"
          loading="lazy"
        />

        <h1 className="mb-4 text-5xl font-bold text-pink-800 md:text-7xl">
          Hello Hilary 💕
        </h1>

        <div className="grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            to="/hilary"
            onClick={handleNavigate("/hilary")}
            className={primaryLinkClass}
          >
            ❤️ Hilary&apos;s Page
          </Link>

          <Link
            to="/gallery"
            onClick={handleNavigate("/gallery")}
            className={primaryLinkClass}
          >
            🎥 Watch Videos
          </Link>

          <Link
            to="/upload"
            onClick={handleNavigate("/upload")}
            className={primaryLinkClass}
          >
            💌 Send Hilary a Hello
          </Link>
        </div>
      </div>
    </main>
  );
}
