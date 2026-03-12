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

      if (!res.ok) throw new Error("Delete failed");

      setShowSuccess(true);
    } catch (err) {
      alert("Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden p-5 flex flex-col">
      <div className="rounded-xl overflow-hidden aspect-video bg-gradient-to-br from-pink-200 to-blue-200">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={video.title || "Video thumbnail"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white font-semibold">
            Video
          </div>
        )}
      </div>

      <div className="mt-4 flex-1">
        <h3 className="text-lg font-semibold text-gray-900 truncate">
          {video.title || "Hello Video"}
        </h3>

        <p className="text-xs text-gray-500 mt-1">
          From {video.display_name || "Someone"}
        </p>
      </div>

      <button
        className="mt-4 w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-lg font-bold py-3 rounded-full shadow hover:scale-[1.02] transition"
        onClick={onPlay}
      >
        ▶ Play
      </button>

      <button
        onClick={() => setShowConfirm(true)}
        className="mt-2 text-xs text-gray-400 hover:text-red-500 transition"
      >
        delete
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <p className="mb-6 font-semibold">Delete this video?</p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-6 py-3 bg-gray-200 rounded-xl"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="px-6 py-3 bg-red-500 text-white rounded-xl"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => window.location.reload()}
        >
          <div className="bg-white rounded-3xl p-8 text-center">
            <div className="text-5xl mb-3">✅</div>
            Deleted
          </div>
        </div>
      )}
    </div>
  );
}
