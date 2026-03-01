import { Link } from "react-router-dom";

// import logo192 from "../assets/HelloHilaryLogo192.png";
import hilaryPhoto from "../assets/hilary.jpg";

export default function Home() {
  const hasNewVideos = true; // Replace with real check later (e.g., from context or query)

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-blue-50 flex flex-col items-center justify-center p-6 text-center">
      {/* <img
        src={logo192}
        alt="Hello Hilary logo"
        className="w-32 h-auto md:w-48 mb-8" // Small on mobile, bigger on iPad/desktop; h-auto keeps proportions
      /> */}
      <img
        src={hilaryPhoto}
        alt="Hilary smiling"
        className="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover mb-6 shadow-xl border-4 border-pink-200"
        loading="lazy"
      />
      <h1 className="text-5xl md:text-7xl font-bold text-pink-800 mb-4 animate-fade-in">
        Hello Hilary 💕
      </h1>
      <p className="text-2xl md:text-3xl text-gray-700 max-w-2xl mb-10">
        Watch short messages, songs, and stories from family and friends.
      </p>

      {hasNewVideos && (
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-6 py-4 rounded-full mb-8 text-xl">
          New hellos added! Tap "Watch Videos" to see them.
        </div>
      )}

      <Link
        to="/gallery"
        className="bg-pink-500 hover:bg-pink-600 text-white text-3xl font-semibold py-6 px-16 rounded-full shadow-xl transition mb-6 focus:outline-none focus:ring-4 focus:ring-pink-300"
      >
        Watch Videos
      </Link>

      <Link to="/signin" className="text-xl text-blue-600 hover:underline">
        Add your own hello →
      </Link>
    </div>
  );
}
