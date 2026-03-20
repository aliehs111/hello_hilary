import { useCallback, useEffect } from "react";

export default function PhotoLightbox({
  isOpen,
  photos = [],
  selectedIndex = null,
  photoUrls = {},
  onClose,
  onPrev,
  onNext,
  onDelete,
  showDelete = false,
}) {
  const selectedPhoto =
    selectedIndex !== null && photos[selectedIndex]
      ? photos[selectedIndex]
      : null;

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowLeft") onPrev?.();
      if (e.key === "ArrowRight") onNext?.();
    },
    [onClose, onPrev, onNext],
  );

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !selectedPhoto) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl overflow-hidden rounded-[2rem] border-4 border-pink-200 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.28)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-pink-100 bg-gradient-to-r from-pink-100 via-rose-50 to-blue-100 px-5 py-4">
          <div>
            <h3 className="text-xl font-bold text-pink-800">
              {selectedPhoto.title || "Photo"}
            </h3>
            <p className="text-sm text-gray-600">
              Uploaded by {selectedPhoto.display_name || "Unknown"}
              {photos.length > 1
                ? ` • ${selectedIndex + 1} of ${photos.length}`
                : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-2.5 text-base font-bold text-white shadow-lg transition hover:scale-[1.02]"
          >
            Close ✕
          </button>
        </div>

        {/* Image area with nav arrows */}
        <div className="relative flex min-h-[320px] items-center justify-center bg-black">
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPrev?.();
                }}
                className="absolute left-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white px-5 py-3 text-3xl font-bold text-pink-700 shadow-2xl transition hover:bg-pink-50"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNext?.();
                }}
                className="absolute right-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white px-5 py-3 text-3xl font-bold text-pink-700 shadow-2xl transition hover:bg-pink-50"
              >
                ›
              </button>
            </>
          )}

          <img
            key={selectedPhoto.id}
            src={photoUrls[selectedPhoto.id] || ""}
            alt={selectedPhoto.title || "Photo"}
            className="max-h-[70vh] w-auto max-w-full object-contain"
          />
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-pink-100 bg-gradient-to-r from-pink-50 to-blue-50 px-5 py-4 sm:flex-row">
          <div className="text-sm text-gray-700">
            {selectedPhoto.caption || "No description"}
          </div>

          {showDelete && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(selectedPhoto.id)}
              className="rounded-full bg-red-500 px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-red-600"
            >
              Delete Photo 🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
