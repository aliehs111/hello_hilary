// src/pages/Hilary.jsx
import { Link } from "react-router-dom";
import HilaryMainPhoto from "../assets/HilPeach.jpg";

export default function Hilary() {
  return (
    <div className="min-h-screen pt-20 px-6 pb-16 bg-gradient-to-b from-pink-50 to-blue-50">
      <div className="max-w-5xl mx-auto">
        {/* Hero profile section */}
        <div className="text-center mb-12">
          <img
            src={HilaryMainPhoto}
            alt="Hilary smiling warmly"
            className="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover mx-auto mb-6 shadow-2xl border-8 border-pink-200"
          />
          <h1 className="text-5xl md:text-6xl font-bold text-pink-800 mb-4">
            Hilary's Page 💕
          </h1>
          <p className="text-2xl md:text-3xl text-gray-700 max-w-3xl mx-auto">
            See what Hilary's been up to!
          </p>
        </div>

        {/* Video grid – similar to Gallery but filtered */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Placeholder cards for Hilary's videos */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition cursor-pointer">
            <div className="aspect-video bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-xl">
                Hilary's Video Placeholder
              </span>
            </div>
            <div className="p-5">
              <h3 className="text-xl font-semibold text-gray-900">
                Hilary Singing a Song
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Uploaded by Mom • 32s
              </p>
            </div>
          </div>

          {/* Duplicate 4–6 times for demo */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition cursor-pointer">
            <div className="aspect-video bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-xl">
                Another Hilary Moment
              </span>
            </div>
            <div className="p-5">
              <h3 className="text-xl font-semibold text-gray-900">
                Hilary's Birthday Hello
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                From the Family • 45s
              </p>
            </div>
          </div>

          {/* ... add more placeholders */}
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/upload"
            className="inline-block bg-pink-500 text-white text-2xl font-semibold py-6 px-12 rounded-full shadow-xl hover:bg-pink-600 transition"
          >
            Add a Video for Hilary
          </Link>
        </div>
      </div>
    </div>
  );
}
