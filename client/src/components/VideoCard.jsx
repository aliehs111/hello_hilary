import { useState } from "react";

export default function VideoCard({ video, thumbnailUrl, onPlay }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setShowConfirm(false);
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/media/${video.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Delete failed");
      }

      setShowSuccess(true);
    } catch (err) {
      alert("Delete failed: " + (err.message || "Unknown error"));
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden p-5 relative">
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

        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-pink-100 text-pink-700">
            {video.status}
          </span>

          <button
            onClick={() => setShowConfirm(true)}
            disabled={isDeleting}
            className={`bg-orange-500 hover:bg-orange-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-md transition ${
              isDeleting ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title="Delete this media"
          >
            {isDeleting ? "⌛" : "🗑"}
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-xl overflow-hidden bg-gradient-to-br from-pink-200 to-blue-200 aspect-video flex items-center justify-center">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={video.title || "Video thumbnail"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-white/90 font-semibold">Video</div>
        )}
      </div>

      <button
        className="mt-5 w-full bg-pink-500 text-white text-lg font-semibold py-3 rounded-full shadow hover:bg-pink-600 transition"
        onClick={onPlay}
        type="button"
      >
        Play
      </button>

      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Delete this {video.media_type || "media"}?
            </h3>
            <p className="text-gray-600 text-lg mb-8">
              This action cannot be undone.
            </p>

            <div className="flex gap-6 justify-center">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 text-lg font-semibold rounded-2xl transition flex-1"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`px-8 py-4 bg-red-600 hover:bg-red-700 text-white text-lg font-semibold rounded-2xl shadow transition flex-1 ${
                  isDeleting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowSuccess(false);
            window.location.reload();
          }}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center border border-green-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-green-700 mb-4">
              Successfully Deleted
            </h3>
            <p className="text-gray-600 text-lg mb-8">
              This {video.media_type || "media"} has been removed.
            </p>

            <button
              onClick={() => {
                setShowSuccess(false);
                window.location.reload();
              }}
              className="px-10 py-4 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold rounded-2xl shadow transition w-full"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
