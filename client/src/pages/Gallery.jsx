// src/pages/Gallery.jsx
import { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import VideoCard from "@/components/VideoCard";
import FilterPanel from "@/components/FilterPanel";

export default function Gallery() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [photoUrls, setPhotoUrls] = useState({});
  const [photoLoadFailed, setPhotoLoadFailed] = useState({});
  const [videoThumbUrls, setVideoThumbUrls] = useState({});

  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerUrl, setPlayerUrl] = useState("");
  const [playerTitle, setPlayerTitle] = useState("");

  const [duration, setDuration] = useState(30);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [uploader, setUploader] = useState("all");
  const [dateRange, setDateRange] = useState("any");

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

              if (!urlRes.ok || !urlData?.url) return [p.id, null];
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

              if (!urlRes.ok || !urlData?.url) return [v.id, null];
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

  const uploaderOptions = useMemo(() => {
    const names = Array.from(
      new Set(videos.map((v) => (v.display_name || "").trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));

    return ["all", ...names];
  }, [videos]);

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setUploader("all");
    setDateRange("any");
  };

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

  const handlePlayAll = () => {
    console.log("Play all videos", {
      duration,
      categories: selectedCategories,
      uploader,
      dateRange,
    });
  };

  const activeFilterCount =
    selectedCategories.length +
    (uploader !== "all" ? 1 : 0) +
    (dateRange !== "any" ? 1 : 0);

  return (
    <div className="min-h-screen pt-20 px-6 pb-16 bg-gradient-to-b from-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        <section className="mb-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-pink-700">
              Hello Hilary 💕
            </h1>
          </div>
        </section>

        {loading && (
          <div className="bg-white/75 backdrop-blur-sm rounded-3xl p-10 text-center shadow-lg">
            <p className="text-xl text-gray-600">Loading…</p>
          </div>
        )}

        {!loading && err && (
          <div className="bg-red-100 border border-red-300 text-red-800 rounded-3xl p-6 text-center shadow-lg">
            {err}
          </div>
        )}

        {!loading && !err && (
          <>
            <section className="mb-10">
              <div className="text-center">
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    onClick={handlePlayAll}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-2xl md:text-3xl font-bold px-10 md:px-14 py-5 md:py-6 rounded-full shadow-xl hover:scale-[1.02] transition"
                  >
                    ▶ Play All Videos
                  </button>

                  <button
                    onClick={() => setFiltersOpen(true)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-2xl md:text-3xl font-bold px-10 md:px-14 py-5 md:py-6 rounded-full shadow-xl hover:scale-[1.02] transition"
                  >
                    🔎 Choose Filters
                  </button>
                </div>

                <div className="mt-4">
                  <p className="mt-5 text-sm text-gray-500">
                    Or choose a video below
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-16">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
            </section>

            <section>
              <h2 className="text-3xl font-bold text-pink-700 text-center mb-6">
                Photos
              </h2>

              {photos.length > 0 ? (
                <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-xl">
                  <Swiper
                    modules={[Pagination, Navigation, Autoplay]}
                    slidesPerView={1}
                    loop={photos.length > 1}
                    autoplay={{ delay: 7000, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    navigation
                    className="h-[250px] md:h-[400px]"
                  >
                    {photos.map((p) => (
                      <SwiperSlide key={p.id}>
                        <div className="relative h-full w-full">
                          {photoUrls[p.id] && !photoLoadFailed[p.id] ? (
                            <img
                              src={photoUrls[p.id]}
                              alt={p.title || "Photo"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                setPhotoLoadFailed((prev) => ({
                                  ...prev,
                                  [p.id]: true,
                                }));
                                console.log(
                                  "[photo] ERROR currentSrc:",
                                  e.currentTarget.currentSrc,
                                );
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
                              </div>
                            </div>
                          )}
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              ) : (
                <div className="bg-white/75 backdrop-blur-sm rounded-3xl p-12 text-center shadow-lg">
                  <p className="text-xl text-gray-600">No photos yet 📸</p>
                </div>
              )}
            </section>
          </>
        )}

        <FilterPanel
          isOpen={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          selectedCategories={selectedCategories}
          onToggleCategory={toggleCategory}
          uploader={uploader}
          onChangeUploader={setUploader}
          uploaderOptions={uploaderOptions}
          dateRange={dateRange}
          onChangeDateRange={setDateRange}
          onClear={clearFilters}
        />

        {playerOpen && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={closePlayer}
          >
            <div
              className="bg-white rounded-xl overflow-hidden max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <video
                key={playerUrl}
                src={playerUrl}
                controls
                autoPlay
                playsInline
                className="w-full max-h-[80vh] bg-black object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
