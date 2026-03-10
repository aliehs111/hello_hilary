// src/components/VideoCard.jsx
export default function VideoCard({ video, onPlay }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-xl font-semibold text-gray-900 truncate">
            {video.title || "Untitled Video"}
          </h3>

          {video.caption && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {video.caption}
            </p>
          )}

          <p className="text-xs text-gray-500 mt-2">
            From {video.display_name || "Someone"}
          </p>
        </div>

        <span className="shrink-0 text-xs font-bold px-3 py-1 rounded-full bg-pink-100 text-pink-700">
          {video.status}
        </span>
      </div>

      {/* thumbnail placeholder (for now) */}
      <div className="mt-4 rounded-xl overflow-hidden bg-gradient-to-br from-pink-200 to-blue-200 aspect-video flex items-center justify-center">
        <div className="text-white/90 font-semibold">Video</div>
      </div>

      <button
        className="mt-5 w-full bg-pink-500 text-white text-lg font-semibold py-3 rounded-full shadow hover:bg-pink-600 transition"
        onClick={onPlay}
        type="button"
      >
        Play
      </button>
    </div>
  );
}
