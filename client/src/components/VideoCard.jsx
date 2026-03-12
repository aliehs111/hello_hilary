import { useState } from "react";

export default function VideoCard({ video, thumbnailUrl, onPlay }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDelete = async () => {
    setShowConfirm(false);

    try {
      const res = await fetch(`/api/media/${video.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Delete failed");
      }

      setShowSuccess(true); // show success modal
    } catch (err) {
      alert("Delete failed"); // keep this simple for errors
      console.error(err);
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

        {/* Status tag + delete button grouped vertically on right */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-pink-100 text-pink-700">
            {video.status}
          </span>

          <button
            onClick={() => setShowConfirm(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-md transition"
            title="Delete this media"
          >
            🗑
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-xl overflow-hidden bg-gradient-to-br from-pink-200 to-blue-200 aspect-video flex items-center justify-center">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={video.title || "Video thumbnail"}
            className="w-full h-full object-cover"
            style={{
              imageOrientation: "from-image",
              transform: "rotate(90deg)", // adjust if needed
              transformOrigin: "center",
            }}
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

      {/* Confirmation modal (Are you sure?) */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Delete this {video.media_type || "item"}?
            </h3>
            <p className="text-gray-600 mb-6">This action cannot be undone.</p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full font-medium transition"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium shadow transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success modal (Deleted!) */}
      {showSuccess && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowSuccess(false);
            window.location.reload(); // refresh after closing
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-green-600 mb-3">Deleted!</h3>
            <p className="text-gray-600 mb-6">
              This {video.media_type || "item"} has been removed.
            </p>

            <button
              onClick={() => {
                setShowSuccess(false);
                window.location.reload();
              }}
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-lg font-medium rounded-full shadow transition w-full"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
