// src/pages/Gallery.jsx
import { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export default function Gallery() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // ✅ Modal player state (MUST be inside component)
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerUrl, setPlayerUrl] = useState("");
  const [playerTitle, setPlayerTitle] = useState("");

  // Load media list
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch("/api/media");
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Failed to load media");
        if (!cancelled) setMedia(data.media || []);
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

  // Close modal on ESC
  useEffect(() => {
    if (!playerOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closePlayer();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            {/* Photos */}
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
                          {/* placeholder until you add presigned photo viewing */}
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

            {/* Videos */}
            <section>
              <h2 className="text-4xl md:text-5xl font-bold text-pink-800 mb-10 text-center">
                Hello Videos
              </h2>

              {videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {videos.map((v) => (
                    <div
                      key={v.id}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {v.title || "Untitled Video"}
                          </h3>
                          {v.caption && (
                            <p className="text-sm text-gray-600 mt-1">
                              {v.caption}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            From {v.display_name || "Someone"}
                          </p>
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-pink-100 text-pink-700">
                          {v.status}
                        </span>
                      </div>

                      <div className="mt-4 text-xs text-gray-400 break-all">
                        {v.original_key}
                      </div>

                      <button
                        className="mt-5 w-full bg-pink-500 text-white text-lg font-semibold py-3 rounded-full shadow hover:bg-pink-600 transition"
                        onClick={() => playVideo(v.original_key, v.title)}
                      >
                        Play
                      </button>
                    </div>
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

        {/* ✅ Modal player goes HERE (still inside max-w container) */}
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
                  src={playerUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-auto max-h-[75vh]"
                />
              </div>
            </div>
          </div>
        )}
        {/* ✅ End modal */}
      </div>
    </div>
  );
}
