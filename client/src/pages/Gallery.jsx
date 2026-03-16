// src/pages/Gallery.jsx
import { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import HelloHilaryLogo192 from "@/assets/HelloHilaryLogo192.png";
import VideoCard from "@/components/VideoCard";
import FilterPanel from "@/components/FilterPanel";

import ConfirmModal from "@/components/ConfirmModal";
import SuccessModal from "@/components/SuccessModal";

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

  const [playlist, setPlaylist] = useState([]);
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [playlistActive, setPlaylistActive] = useState(false);
  const [playlistEndTime, setPlaylistEndTime] = useState(null);

  const [duration, setDuration] = useState(1800);

  const [filtersOpen, setFiltersOpen] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [uploader, setUploader] = useState("all");
  const [dateRange, setDateRange] = useState("any");

  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const [showPhotoDeleteConfirm, setShowPhotoDeleteConfirm] = useState(false);
  const [showPhotoDeleteSuccess, setShowPhotoDeleteSuccess] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr("");

      try {
        const params = new URLSearchParams();

        if (selectedCategories.length > 0) {
          params.set("categories", selectedCategories.join(","));
        }

        if (uploader !== "all") {
          params.set("uploader", uploader);
        }

        if (dateRange !== "any") {
          params.set("dateRange", dateRange);
        }

        const url = `/api/media${params.toString() ? `?${params.toString()}` : ""}`;

        const res = await fetch(url);
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
  }, [selectedCategories, uploader, dateRange]);

  const photos = useMemo(
    () => media.filter((m) => m.media_type === "photo"),
    [media],
  );

  const videos = useMemo(
    () => media.filter((m) => m.media_type === "video"),
    [media],
  );

  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      const matchesCategories =
        selectedCategories.length === 0 ||
        selectedCategories.some((cat) => (v.categories || []).includes(cat));

      const matchesUploader =
        uploader === "all" || (v.display_name || "").trim() === uploader;

      let matchesDate = true;
      if (dateRange !== "any") {
        const createdAt = new Date(v.created_at);
        const now = new Date();
        const diffMs = now - createdAt;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (dateRange === "week") matchesDate = diffDays <= 7;
        if (dateRange === "month") matchesDate = diffDays <= 30;
        if (dateRange === "year") matchesDate = diffDays <= 365;
      }

      return matchesCategories && matchesUploader && matchesDate;
    });
  }, [videos, selectedCategories, uploader, dateRange]);

  const uploaderOptions = useMemo(() => {
    const names = Array.from(
      new Set(videos.map((v) => (v.display_name || "").trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));

    return ["all", ...names];
  }, [videos]);

  const startRandomVibe = () => {
    const vibe = VIBES[Math.floor(Math.random() * VIBES.length)];

    setSelectedCategories(vibe.categories);
    setDuration(vibe.duration);

    setTimeout(() => {
      handlePlayAll();
    }, 50);
  };

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

    // stop playlist session if user closes player
    setPlaylistActive(false);
  };

  const openPhotoViewer = (photo) => {
    setSelectedPhoto(photo);
    setPhotoViewerOpen(true);
  };

  const closePhotoViewer = () => {
    setSelectedPhoto(null);
    setPhotoViewerOpen(false);
  };

  const handleDeleteMedia = async (id) => {
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Delete failed");
      }

      setMedia((prev) => prev.filter((m) => m.id !== id));
      setShowPhotoDeleteConfirm(false);
      closePhotoViewer();
      setShowPhotoDeleteSuccess(true);
    } catch (e) {
      alert(e.message || "Failed to delete media");
    }
  };

  useEffect(() => {
    if (!playerOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closePlayer();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [playerOpen]);

  useEffect(() => {
    if (!playlistActive) return;
    if (!playlist.length) return;

    const current = playlist[playlistIndex];
    if (!current) return;

    playVideo(current.playback_key || current.original_key, current.title);
  }, [playlistActive, playlist, playlistIndex]);

  const playVideo = async (key, title) => {
    try {
      setVideoLoading(true);

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
      setVideoLoading(false);
      alert(e.message || "Could not play video");
    }
  };

  const refreshGallery = () => {
    window.location.reload();
  };

  const shuffleVideos = (items) => {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const handleVideoEnd = () => {
    if (!playlistActive) return;

    // stop if session time expired
    if (playlistEndTime && Date.now() > playlistEndTime) {
      setPlaylistActive(false);
      closePlayer();
      return;
    }

    let nextIndex = playlistIndex + 1;

    // if we reached the end, reshuffle and start again
    if (nextIndex >= playlist.length) {
      const reshuffled = shuffleVideos(playlist);
      setPlaylist(reshuffled);
      nextIndex = 0;
    }

    setPlaylistIndex(nextIndex);
  };

  const VIBES = [
    {
      name: "Cheer Her Up",
      categories: ["Funny", "Animals", "Singing"],
      duration: 900, // 15 minutes
    },
    {
      name: "Relaxing",
      categories: ["Just a Hello", "Reading a Book", "Nature"],
      duration: 1200, // 20 minutes
    },
    {
      name: "Animal Friends",
      categories: ["Animals"],
      duration: 600, // 10 minutes
    },
    {
      name: "Music Time",
      categories: ["Music Performance", "Singing"],
      duration: 900,
    },
    {
      name: "Family Memories",
      categories: ["Memories", "Babies and Little People"],
      duration: 1200,
    },
  ];

  const handlePlayAll = () => {
    if (videos.length === 0) return;

    const shuffled = shuffleVideos(videos);

    setPlaylist(shuffled);
    setPlaylistIndex(0);
    setPlaylistActive(true);
    setPlaylistEndTime(null);
  };

  const handlePlayFiltered = () => {
    if (filteredVideos.length === 0) return;

    const shuffled = shuffleVideos(filteredVideos);

    setPlaylist(shuffled);
    setPlaylistIndex(0);
    setPlaylistActive(true);
    setPlaylistEndTime(Date.now() + duration * 1000);
  };

  const activeFilterCount =
    selectedCategories.length +
    (uploader !== "all" ? 1 : 0) +
    (dateRange !== "any" ? 1 : 0);

  return (
    <div className="min-h-screen pt-10 px-6 pb-16 bg-gradient-to-b from-pink-50 to-blue-50">
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
                    className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-rose-500 text-white text-lg md:text-xl font-bold px-6 md:px-8 py-3 md:py-4 rounded-full shadow-lg hover:scale-[1.02] transition"
                  >
                    ▶ Play All Videos
                  </button>

                  <button
                    onClick={() => setFiltersOpen(true)}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-lg md:text-xl font-bold px-6 md:px-8 py-3 md:py-4 rounded-full shadow-lg hover:scale-[1.02] transition"
                  >
                    🔎 Choose Filters
                  </button>
                </div>
                <div className="flex justify-center mt-8">
                  <button
                    onClick={startRandomVibe}
                    className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg md:text-xl font-bold px-6 md:px-8 py-3 md:py-4 rounded-full shadow-lg hover:scale-[1.02] transition"
                  >
                    <img
                      src={HelloHilaryLogo192}
                      alt="Doddy"
                      className="w-8 h-8"
                    />
                    Let Doddy Pick the Reels!
                  </button>
                </div>
              </div>
            </section>

            <section className="mb-16">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="text-center md:text-left">
                  <button
                    onClick={refreshGallery}
                    className="px-4 py-2 rounded-full border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition"
                  >
                    ↻ Refresh Gallery
                  </button>

                  <p className="text-lg font-semibold text-pink-700">
                    Showing {filteredVideos.length} video
                    {filteredVideos.length === 1 ? "" : "s"}
                  </p>
                </div>

                {activeFilterCount > 0 && (
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">
                      Play for
                    </label>

                    <select
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="rounded-xl border border-pink-200 bg-white px-4 py-2 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                    >
                      <option value={600}>10 minutes</option>
                      <option value={1200}>20 minutes</option>
                      <option value={1800}>30 minutes</option>
                      <option value={2400}>40 minutes</option>
                      <option value={3600}>60 minutes</option>
                    </select>

                    <button
                      onClick={handlePlayFiltered}
                      disabled={filteredVideos.length === 0}
                      className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold px-6 py-3 shadow-lg hover:scale-[1.01] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ▶ Play These Videos
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredVideos.map((v) => (
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
                        <div
                          className="relative h-full w-full cursor-pointer"
                          onClick={() => openPhotoViewer(p)}
                        >
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

        {photoViewerOpen && selectedPhoto && (
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closePhotoViewer}
          >
            <div
              className="w-full max-w-4xl overflow-hidden rounded-[2rem] border-4 border-pink-200 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.28)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between bg-gradient-to-r from-pink-100 via-rose-50 to-blue-100 px-5 py-4 border-b border-pink-100">
                <div>
                  <h3 className="text-xl font-bold text-pink-800">
                    {selectedPhoto.title || "Photo"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Uploaded by {selectedPhoto.display_name || "Unknown"}
                  </p>
                </div>

                <button
                  onClick={closePhotoViewer}
                  className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-2.5 text-base font-bold text-white shadow-lg hover:scale-[1.02] transition"
                >
                  Close ✕
                </button>
              </div>

              <div className="bg-black flex justify-center">
                <img
                  src={photoUrls[selectedPhoto.id]}
                  alt={selectedPhoto.title || "Photo"}
                  className="max-h-[70vh] w-auto object-contain"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-pink-50 to-blue-50 px-5 py-4 border-t border-pink-100">
                <div className="text-sm text-gray-700">
                  {selectedPhoto.caption || "No description"}
                </div>

                <button
                  onClick={() => setShowPhotoDeleteConfirm(true)}
                  className="rounded-full bg-red-500 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-red-600 transition"
                >
                  Delete Photo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PHOTO DELETE CONFIRM MODAL */}
        <ConfirmModal
          isOpen={showPhotoDeleteConfirm}
          title="Delete this photo?"
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={() => handleDeleteMedia(selectedPhoto.id)}
          onCancel={() => setShowPhotoDeleteConfirm(false)}
        />

        <SuccessModal
          isOpen={showPhotoDeleteSuccess}
          title="Deleted"
          message="The photo was deleted."
          onClose={() => setShowPhotoDeleteSuccess(false)}
        />

        {playerOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closePlayer}
          >
            <div
              className="w-full max-w-5xl overflow-hidden rounded-[2rem] border-4 border-pink-200 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.28)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between bg-gradient-to-r from-pink-100 via-rose-50 to-blue-100 px-5 py-4 border-b border-pink-100">
                <div className="min-w-0">
                  <h3 className="truncate text-xl font-bold text-pink-800">
                    {playerTitle || "Hello Video"}
                  </h3>
                  {playlistActive && playlist.length > 0 && (
                    <p className="text-sm font-medium text-gray-600">
                      Video {playlistIndex + 1} of {playlist.length}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={closePlayer}
                  className="ml-4 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-2.5 text-base font-bold text-white shadow-lg hover:scale-[1.02] transition"
                  aria-label="Close player"
                >
                  Close ✕
                </button>
              </div>

              <div className="bg-black">
                <video
                  key={playerUrl}
                  src={playerUrl}
                  controls
                  autoPlay
                  playsInline
                  preload="auto"
                  onLoadedData={(e) => e.target.play()}
                  onEnded={handleVideoEnd}
                  className="w-full max-h-[74vh] bg-black object-contain"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-pink-50 to-blue-50 px-5 py-4 border-t border-pink-100">
                <div className="text-sm font-medium text-gray-600 text-center sm:text-left">
                  {playlistActive
                    ? "Playlist is running"
                    : "Single video playback"}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={closePlayer}
                    className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50 transition"
                  >
                    Stop
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
