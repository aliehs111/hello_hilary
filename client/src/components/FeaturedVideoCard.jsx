export default function FeaturedVideoCard({ video, thumbnailUrl, onPlay }) {
  return (
    <button onClick={onPlay} className="group shrink-0 w-40 text-left">
      <div className="relative rounded-2xl overflow-hidden shadow-lg">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={video.title || "Featured video thumbnail"}
            className="w-full h-40 object-cover group-hover:scale-105 transition"
          />
        ) : (
          <div className="w-full h-40 bg-gradient-to-br from-pink-200 to-blue-200 flex items-center justify-center text-white font-semibold">
            Video
          </div>
        )}

        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-white/85 px-4 py-2 text-sm font-bold text-pink-600 shadow">
            ▶ Play
          </div>
        </div>
      </div>
    </button>
  );
}
