import { useState } from "react";

import ConfirmModal from "@/components/ConfirmModal";
import SuccessModal from "@/components/SuccessModal";

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
    <div
      className={`bg-white rounded-3xl overflow-hidden p-5 flex flex-col transition
  ${
    video.is_featured
      ? "shadow-[0_0_0_3px_rgba(236,72,153,0.35),0_12px_30px_rgba(236,72,153,0.25)]"
      : "shadow-xl"
  }`}
    >
      <div className="relative rounded-xl overflow-hidden aspect-video bg-gradient-to-br from-pink-200 to-blue-200">
        {video.is_featured && (
          <div className="absolute top-2 left-2 bg-pink-600 text-white text-xs px-3 py-1 rounded-full shadow">
            Featured
          </div>
        )}

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

      <ConfirmModal
        isOpen={showConfirm}
        title="Delete this video?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />

      <SuccessModal
        isOpen={showSuccess}
        title="Deleted"
        message="The video was deleted."
        onClose={() => {
          setShowSuccess(false);
          window.location.reload();
        }}
      />
    </div>
  );
}
