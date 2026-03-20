import { useState } from "react";
import ConfirmModal from "@/components/ConfirmModal";

export default function VideoCard({
  video,
  thumbnailUrl,
  onPlay,
  onDelete,
  onEdit,
  showDelete = true,
  showEdit = true,
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;

    setShowConfirm(false);
    setIsDeleting(true);

    try {
      await onDelete(video.id);
    } catch (err) {
      console.error("Video delete failed:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        className={`group relative overflow-hidden rounded-[32px] transition duration-300 hover:-translate-y-1 ${
          video.is_featured
            ? "shadow-[0_0_0_3px_rgba(236,72,153,0.35),0_20px_60px_rgba(236,72,153,0.35)]"
            : "shadow-[0_18px_45px_rgba(0,0,0,0.12)]"
        }`}
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] bg-gradient-to-br from-pink-200 via-rose-100 to-blue-200">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={video.title || "Video thumbnail"}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-white text-lg font-semibold">
              Video
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />

          {video.is_featured && (
            <div className="absolute left-4 top-4 z-20 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
              Featured
            </div>
          )}

          <button
            type="button"
            onClick={onPlay}
            className="absolute right-4 top-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-pink-600 text-lg shadow-xl transition hover:scale-105"
            aria-label={`Play ${video.title || "video"}`}
          >
            ▶
          </button>

          <div className="absolute inset-x-4 bottom-4 z-20">
            <div className="rounded-[18px] bg-black/35 px-4 py-2 backdrop-blur-xl">
              <h3 className="truncate text-sm font-semibold text-white">
                {video.title || "Hello Video"}
              </h3>

              <p className="text-xs text-white/80">
                From {video.display_name || "Someone"}
              </p>
            </div>
          </div>

          {showEdit && onEdit && (
            <div className="mt-3 flex justify-end px-2 pb-2">
              <button
                type="button"
                onClick={() => onEdit(video)}
                className="absolute bottom-3 right-20 z-30 opacity-100 md:opacity-0 md:group-hover:opacity-100 rounded-full bg-white/80 text-blue-600 text-xs px-3 py-1 shadow backdrop-blur hover:bg-blue-500 hover:text-white transition"
              >
                Edit
              </button>
            </div>
          )}

          {showDelete && onDelete && (
            <div className="mt-3 flex justify-end px-2 pb-2">
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                disabled={isDeleting}
                className="absolute bottom-3 right-3 z-30 opacity-100 md:opacity-0 md:group-hover:opacity-100 rounded-full bg-white/80 text-red-500 text-xs px-3 py-1 shadow backdrop-blur hover:bg-red-500 hover:text-white transition disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="Delete this video?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
