import { useEffect, useRef, useState } from "react";

export default function VideoPlayerModal({
  isOpen,
  title,
  url,
  poster,
  videoLoading,
  playlistActive = false,
  playlistIndex = 0,
  playlistLength = 0,
  onClose,
  onLoadedData,
  onEnded,
  onNext,
  onPrev,
}) {
  const videoRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const stalledTimer = useRef(null);

  const clearStalledTimer = () => {
    if (stalledTimer.current) {
      clearTimeout(stalledTimer.current);
      stalledTimer.current = null;
    }
  };

  useEffect(() => {
    setIsPaused(false);
    clearStalledTimer();
    return () => clearStalledTimer();
  }, [url]);

  if (!isOpen) return null;

  const handlePauseToggle = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
        setIsPaused(false);
      } catch {
        // ignore autoplay/play interruption errors
      }
    } else {
      video.pause();
      setIsPaused(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl overflow-hidden rounded-[2rem] border-4 border-pink-200 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.28)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between bg-gradient-to-r from-pink-100 via-rose-50 to-blue-100 px-5 py-4 border-b border-pink-100">
          <div className="min-w-0">
            <h3 className="truncate text-xl font-bold text-pink-800">
              {title || "Video"}
            </h3>
            {playlistActive && playlistLength > 0 && (
              <p className="text-sm font-medium text-gray-600">
                Video {playlistIndex + 1} of {playlistLength}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-4 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-2.5 text-base font-bold text-white shadow-lg hover:scale-[1.02] transition"
            aria-label="Close player"
          >
            Close ✕
          </button>
        </div>

        <div className="relative bg-black flex items-center justify-center min-h-[300px]">
          {videoLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
              <div className="text-white text-sm font-semibold animate-pulse">
                Loading video...
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            key={url}
            src={url}
            poster={poster}
            controls={false}
            autoPlay
            playsInline
            preload="auto"
            onLoadedData={onLoadedData}
            onEnded={onEnded}
            onPlaying={clearStalledTimer}
            onWaiting={() => {
              clearStalledTimer();
              stalledTimer.current = setTimeout(() => {
                if (onNext) onNext();
              }, 15000);
            }}
            onError={() => {
              clearStalledTimer();
              if (onNext) setTimeout(onNext, 1500);
            }}
            className={`w-full max-h-[74vh] bg-black object-contain transition-opacity duration-200 ${
              videoLoading ? "opacity-0" : "opacity-100"
            }`}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-pink-50 to-blue-50 px-5 py-4 border-t border-pink-100">
          <div className="text-sm font-medium text-gray-600 text-center sm:text-left">
            {isPaused
              ? "Playback paused"
              : playlistActive
                ? "Playlist is running"
                : "Single video playback"}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePauseToggle}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50 transition"
            >
              {isPaused ? "Resume ▶" : "Pause ❚❚"}
            </button>

            {playlistActive && playlistLength > 1 && (
              <>
                <button
                  type="button"
                  onClick={onPrev}
                  className="rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02]"
                >
                  ◀ Previous
                </button>

                <button
                  type="button"
                  onClick={onNext}
                  className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02]"
                >
                  Next ▶
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
