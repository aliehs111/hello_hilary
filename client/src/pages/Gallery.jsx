// src/pages/Gallery.jsx
import { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import VideoCard from "@/components/VideoCard";

export default function Gallery() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [photoUrls, setPhotoUrls] = useState({});
  const [photoLoadFailed, setPhotoLoadFailed] = useState({});
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerUrl, setPlayerUrl] = useState("");
  const [playerTitle, setPlayerTitle] = useState("");
  const [videoThumbUrls, setVideoThumbUrls] = useState({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr("");

      try {
        const res = await fetch("/api/media");
        const data = await res.json().catch(() => ({}));

        if (!res.ok) throw new Error(data?.error || "Failed to load media");

        const mediaItems = data.media || [];
        if (!cancelled) setMedia(mediaItems);

        const photosOnly = mediaItems.filter((m) => m.media_type === "photo");
        const videosOnly = mediaItems.filter((m) => m.media_type === "video");

        const photoEntries = await Promise.all(
          photosOnly.map(async (p) => {
            try {
              const urlRes = await fetch(
                `/api/s3/presign-download?key=${encodeURIComponent(p.original_key)}`,
              );
              const urlData = await urlRes.json().catch(() => ({}));

              if (!urlRes.ok || !urlData?.url) {
                return [p.id, null];
              }

              return [p.id, urlData.url];
            } catch {
              return [p.id, null];
            }
          }),
        );

        const videoThumbEntries = await Promise.all(
          videosOnly.map(async (v) => {
            try {
              if (!v.thumbnail_key) return [v.id, null];

              const urlRes = await fetch(
                `/api/s3/presign-download?key=${encodeURIComponent(v.thumbnail_key)}`,
              );
              const urlData = await urlRes.json().catch(() => ({}));

              if (!urlRes.ok || !urlData?.url) {
                return [v.id, null];
              }

              return [v.id, urlData.url];
            } catch {
              return [v.id, null];
            }
          }),
        );

        if (!cancelled) {
          setPhotoUrls(Object.fromEntries(photoEntries));
          setVideoThumbUrls(Object.fromEntries(videoThumbEntries));
        }
      } catch (e) {
        if (!cancelled) setErr(e.message || "Failed to load media");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const photos = useMemo(
    () => media.filter((m) => m.media_type === "photo"),
    [media],
  );

  const videos = useMemo(
    () => media.filter((m) => m.media_type === "video"),
    [media],
  );

  const closePlayer = () => {
    setPlayerOpen(false);
    setPlayerUrl("");
    setPlayerTitle("");
  };

  useEffect(() => {
    if (!playerOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closePlayer();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [playerOpen]);

  const playVideo = async (key, title) => {
    try {
      const res = await fetch(
        `/api/s3/presign-download?key=${encodeURIComponent(key)}`,
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data?.error || "Failed to get video URL");
      if (!data?.url) throw new Error("No URL returned");

      setPlayerUrl(data.url);
      setPlayerTitle(title || "Hello Video");
      setPlayerOpen(true);
    } catch (e) {
      alert(e.message || "Could not play video");
    }
  };

  return (
    <div className="min-h-screen pt-20 px-6 pb-16 bg-gradient-to-b from-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-pink-800 mb-10 text-center">
          Hello Hilary Gallery 💕
        </h1>

        {loading && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-10 text-center shadow-lg">
            <p className="text-xl text-gray-600">Loading…</p>
          </div>
        )}

        {!loading && err && (
          <div className="bg-red-100 border border-red-300 text-red-800 rounded-2xl p-6 text-center shadow-lg">
            {err}
          </div>
        )}

        {!loading && !err && (
          <>
            <section className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-pink-700 mb-6 text-center">
                Recent Photos
              </h2>

              {photos.length > 0 ? (
                <div className="relative rounded-2xl overflow-hidden shadow-xl mx-auto max-w-4xl">
                  <Swiper
                    modules={[Pagination, Navigation, Autoplay]}
                    spaceBetween={0}
                    slidesPerView={1}
                    centeredSlides
                    loop={photos.length > 1}
                    autoplay={{
                      delay: 7000,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }}
                    pagination={{
                      clickable: true,
                      bulletClass:
                        "swiper-pagination-bullet !bg-pink-400 !opacity-70",
                      bulletActiveClass: "!bg-pink-600 !opacity-100",
                    }}
                    navigation={{
                      nextEl: ".swiper-button-next",
                      prevEl: ".swiper-button-prev",
                    }}
                    className="h-[200px] sm:h-[300px] md:h-[400px]"
                  >
                    {photos.map((p) => (
                      <SwiperSlide key={p.id}>
                        <div className="relative h-full w-full">
                          {photoUrls[p.id] && !photoLoadFailed[p.id] ? (
                            <img
                              src={photoUrls[p.id]}
                              alt={p.title || "Photo"}
                              className="h-full w-full object-cover"
                              onLoad={() => {
                                console.log("[photo] loaded id:", p.id);
                                console.log(
                                  "[photo] loaded key:",
                                  p.original_key,
                                );
                                console.log(
                                  "[photo] loaded url:",
                                  photoUrls[p.id],
                                );
                              }}
                              onError={(e) => {
                                console.log("[photo] ERROR id:", p.id);
                                console.log(
                                  "[photo] ERROR key:",
                                  p.original_key,
                                );
                                console.log(
                                  "[photo] ERROR url:",
                                  photoUrls[p.id],
                                );
                                console.log(
                                  "[photo] ERROR currentSrc:",
                                  e.currentTarget.currentSrc,
                                );
                                setPhotoLoadFailed((prev) => ({
                                  ...prev,
                                  [p.id]: true,
                                }));
                              }}
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-200 to-blue-200 flex items-center justify-center">
                              <div className="text-center px-6">
                                <div className="text-white text-xl font-semibold drop-shadow">
                                  {p.title || "Photo"}
                                </div>
                                <div className="text-white/90 mt-2 drop-shadow">
                                  {p.caption || ""}
                                </div>
                                <div className="mt-4 inline-block text-xs font-bold px-3 py-1 rounded-full bg-white/80 text-pink-700">
                                  {p.status}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  <button className="swiper-button-prev absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-5 text-pink-600 hover:bg-white hover:text-pink-800 shadow-lg transition">
                    ←
                  </button>
                  <button className="swiper-button-next absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-5 text-pink-600 hover:bg-white hover:text-pink-800 shadow-lg transition">
                    →
                  </button>
                </div>
              ) : (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg">
                  <p className="text-xl text-gray-600">
                    No photos yet — upload one to brighten Hilary&apos;s day! 📸
                  </p>
                </div>
              )}
            </section>

            <section>
              <h2 className="text-4xl md:text-5xl font-bold text-pink-800 mb-10 text-center">
                Hello Videos
              </h2>

              {videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {videos.map((v) => (
                    <VideoCard
                      key={v.id}
                      video={v}
                      thumbnailUrl={videoThumbUrls[v.id]}
                      onPlay={() =>
                        playVideo(v.playback_key || v.original_key, v.title)
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg">
                  <p className="text-xl text-gray-600">
                    No videos yet — be the first to say hello! 🎥
                  </p>
                </div>
              )}
            </section>
          </>
        )}

        {playerOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            onClick={closePlayer}
          >
            <div
              className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <div className="font-semibold text-gray-900 truncate">
                  {playerTitle}
                </div>
                <button
                  className="text-gray-600 hover:text-gray-900 text-2xl leading-none"
                  onClick={closePlayer}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="bg-black">
                <video
                  key={playerUrl}
                  src={playerUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-auto max-h-[75vh] object-contain" // changed to contain to avoid cropping after rotation
                  style={{
                    imageOrientation: "from-image", // respect embedded rotation metadata
                    transform: "rotate(90deg)", // force 90° clockwise (most common for vertical iPhone videos)
                    transformOrigin: "center center",
                  }}
                  onError={(e) => {
                    console.log("[video] ERROR", {
                      error: e.currentTarget.error,
                      code: e.currentTarget.error?.code,
                      message: e.currentTarget.error?.message,
                      networkState: e.currentTarget.networkState,
                      readyState: e.currentTarget.readyState,
                      currentSrc: e.currentTarget.currentSrc,
                    });
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
