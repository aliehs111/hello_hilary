// src/pages/Gallery.jsx
import { useEffect, useMemo, useRef, useState } from "react";
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
import VideoPlayerModal from "@/components/VideoPlayerModal";
import { MEDIA_CATEGORIES } from "@/constants/mediaCategories";
import EditVideoModal from "@/components/EditVideoModal";
import PermissionModal from "@/components/PermissionModal";
import { useAuth } from "@/context/AuthContext";

const VIBES = [
  {
    name: "Cheer Her Up",
    categories: ["Funny", "Animals", "Singing"],
    duration: 900,
  },
  {
    name: "Relaxing",
    categories: ["Just a Hello", "Reading a Book", "Nature"],
    duration: 1200,
  },
  {
    name: "Animal Friends",
    categories: ["Animals"],
    duration: 600,
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

export default function Gallery() {
  const { currentUser } = useAuth();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [photoUrls, setPhotoUrls] = useState({});
  const [photoLoadFailed, setPhotoLoadFailed] = useState({});
  const [videoThumbUrls, setVideoThumbUrls] = useState({});

  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerUrl, setPlayerUrl] = useState("");
  const [playerTitle, setPlayerTitle] = useState("");
  const [playerPoster, setPlayerPoster] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);

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
  const [showPhotoPermission, setShowPhotoPermission] = useState(false);
  const [showPhotoDeleteSuccess, setShowPhotoDeleteSuccess] = useState(false);
  const [showVideoDeleteSuccess, setShowVideoDeleteSuccess] = useState(false);

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false); // <-- ADD THIS
  const [editForm, setEditForm] = useState({
    title: "",
    caption: "",
    categories: [],
  });

  const handleOpenEdit = (video) => {
    setEditingVideo(video);
    setEditForm({
      title: video.title || "",
      caption: video.caption || "",
      categories: video.categories || [],
    });
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
    setEditingVideo(null);
    setEditForm({
      title: "",
      caption: "",
      categories: [],
    });
  };

  const handleSaveEdit = async () => {
    if (!editingVideo) return;

    try {
      setIsSavingEdit(true);

      const res = await fetch(`/api/media/${editingVideo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: editForm.title,
          caption: editForm.caption,
          categories: editForm.categories,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to update media");
      }

      setMedia((prev) =>
        prev.map((m) => (m.id === editingVideo.id ? data.media : m)),
      );

      handleCloseEdit();
    } catch (e) {
      alert(e.message || "Failed to save changes");
    } finally {
      setIsSavingEdit(false);
    }
  };

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
        const res = await fetch(url, { credentials: "include" });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.error || "Failed to load media");
        }

        const mediaItems = data.media || [];

        if (cancelled) return;

        setMedia(mediaItems);

        const photosOnly = mediaItems.filter((m) => m.media_type === "photo");
        const videosOnly = mediaItems.filter((m) => m.media_type === "video");

        const photoEntries = await Promise.all(
          photosOnly.map(async (p) => {
            try {
              const urlRes = await fetch(
                `/api/s3/presign-download?key=${encodeURIComponent(
                  p.original_key,
                )}`,
                { credentials: "include" },
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
                `/api/s3/presign-download?key=${encodeURIComponent(
                  v.thumbnail_key,
                )}`,
                { credentials: "include" },
              );
              const urlData = await urlRes.json().catch(() => ({}));

              if (!urlRes.ok || !urlData?.url) return [v.id, null];
              return [v.id, urlData.url];
            } catch {
              return [v.id, null];
            }
          }),
        );

        if (cancelled) return;

        setPhotoUrls(Object.fromEntries(photoEntries));
        setVideoThumbUrls(Object.fromEntries(videoThumbEntries));
      } catch (e) {
        if (!cancelled) {
          setErr(e.message || "Failed to load media");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [selectedCategories, uploader, dateRange]);

  useEffect(() => {
    if (!playerOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        closePlayer();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [playerOpen]);

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

  const shuffleVideos = (items) => {
    const arr = [...items];

    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
  };

  const refreshGallery = () => {
    window.location.reload();
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
    setPlayerPoster("");
    setVideoLoading(false);
    setPlaylistActive(false);
  };

  const playVideo = async (key, title, poster = "") => {
    try {
      setVideoLoading(true);
      const res = await fetch(
        `/api/s3/presign-download?key=${encodeURIComponent(key)}`,
        { credentials: "include" },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to get video URL");
      if (!data?.url) throw new Error("No URL returned");
      setPlayerUrl(data.url);
      setPlayerTitle(title || "Hilary Video");
      setPlayerPoster(poster || "");
      setPlayerOpen(true);
    } catch (e) {
      setVideoLoading(false);
      alert(e.message || "Could not play video");
    }
  };

  useEffect(() => {
    if (!playlistActive) return;
    if (!playlist.length) return;
    const current = playlist[playlistIndex];
    if (!current) return;
    playVideo(
      current.playback_key || current.original_key,
      current.title,
      videoThumbUrls[current.id] || "",
    );
  }, [playlistActive, playlist, playlistIndex, videoThumbUrls]);

  const openPhotoViewer = (photo) => {
    const index = photos.findIndex((p) => p.id === photo.id);
    setSelectedPhoto(photo);
    setSelectedPhotoIndex(index);
    setPhotoViewerOpen(true);
  };

  const closePhotoViewer = () => {
    setSelectedPhoto(null);
    setSelectedPhotoIndex(null);
    setPhotoViewerOpen(false);
    setShowPhotoDeleteConfirm(false);
  };

  const goToNextPhoto = () => {
    if (!photos.length || selectedPhotoIndex === null) return;

    const nextIndex = (selectedPhotoIndex + 1) % photos.length;
    setSelectedPhotoIndex(nextIndex);
    setSelectedPhoto(photos[nextIndex]);
  };

  const goToPreviousPhoto = () => {
    if (!photos.length || selectedPhotoIndex === null) return;

    const prevIndex = (selectedPhotoIndex - 1 + photos.length) % photos.length;
    setSelectedPhotoIndex(prevIndex);
    setSelectedPhoto(photos[prevIndex]);
  };

  const goToNextRef = useRef(goToNextPhoto);
  const goToPrevRef = useRef(goToPreviousPhoto);
  const closeViewerRef = useRef(closePhotoViewer);

  useEffect(() => {
    goToNextRef.current = goToNextPhoto;
  }, [goToNextPhoto]);
  useEffect(() => {
    goToPrevRef.current = goToPreviousPhoto;
  }, [goToPreviousPhoto]);
  useEffect(() => {
    closeViewerRef.current = closePhotoViewer;
  }, [closePhotoViewer]);

  useEffect(() => {
    if (!photoViewerOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeViewerRef.current?.();
      if (e.key === "ArrowRight") goToNextRef.current?.();
      if (e.key === "ArrowLeft") goToPrevRef.current?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [photoViewerOpen]);

  const handleDeleteVideo = async (id) => {
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Delete failed");
      }

      setMedia((prev) => prev.filter((m) => m.id !== id));
      setShowVideoDeleteSuccess(true);
    } catch (e) {
      alert(e.message || "Failed to delete video");
      throw e;
    }
  };

  const handleDeletePhoto = async (id) => {
    if (!id) return;

    try {
      const res = await fetch(`/api/media/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Delete failed");
      }

      setMedia((prev) => prev.filter((m) => m.id !== id));
      setPhotoUrls((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setPhotoLoadFailed((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

      setShowPhotoDeleteConfirm(false);
      setPhotoViewerOpen(false);
      setSelectedPhoto(null);
      setShowPhotoDeleteSuccess(true);
    } catch (e) {
      alert(e.message || "Failed to delete photo");
    }
  };

  const advancePlaylist = () => {
    if (!playlistActive || playlist.length === 0) return;

    if (playlistEndTime && Date.now() > playlistEndTime) {
      setPlaylistActive(false);
      closePlayer();
      return;
    }

    let nextIndex = playlistIndex + 1;

    if (nextIndex >= playlist.length) {
      const reshuffled = shuffleVideos(playlist);
      setPlaylist(reshuffled);
      nextIndex = 0;
    }

    setPlaylistIndex(nextIndex);
  };

  const handleVideoEnd = () => {
    advancePlaylist();
  };

  const handleNextVideo = () => {
    advancePlaylist();
  };

  const goToPrevious = () => {
    if (!playlistActive || playlist.length === 0) return;

    let prevIndex = playlistIndex - 1;

    if (prevIndex < 0) {
      // wrap to end
      prevIndex = playlist.length - 1;
    }

    setPlaylistIndex(prevIndex);
  };

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

  const startRandomVibe = () => {
    const vibe = VIBES[Math.floor(Math.random() * VIBES.length)];

    setSelectedCategories(vibe.categories);
    setDuration(vibe.duration);

    setTimeout(() => {
      handlePlayAll();
    }, 50);
  };

  const activeFilterCount =
    selectedCategories.length +
    (uploader !== "all" ? 1 : 0) +
    (dateRange !== "any" ? 1 : 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-blue-50 px-6 pb-16 pt-10">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-pink-700 md:text-6xl">
              Hello Hilary 💕
            </h1>
          </div>
        </section>

        {loading && (
          <div className="rounded-3xl bg-white/75 p-10 text-center shadow-lg backdrop-blur-sm">
            <p className="text-xl text-gray-600">Loading…</p>
          </div>
        )}

        {!loading && err && (
          <div className="rounded-3xl border border-red-300 bg-red-100 p-6 text-center text-red-800 shadow-lg">
            {err}
          </div>
        )}

        {!loading && !err && (
          <>
            <section className="mb-10">
              <div className="text-center">
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <button
                    onClick={handlePlayAll}
                    className="w-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-3 text-lg font-bold text-white shadow-lg transition hover:scale-[1.02] sm:w-auto md:px-8 md:py-4 md:text-xl"
                  >
                    ▶ Play All Videos
                  </button>

                  <button
                    onClick={() => setFiltersOpen(true)}
                    className="w-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 text-lg font-bold text-white shadow-lg transition hover:scale-[1.02] sm:w-auto md:px-8 md:py-4 md:text-xl"
                  >
                    🔎 Choose Filters
                  </button>
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    onClick={startRandomVibe}
                    className="flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-lg font-bold text-white shadow-lg transition hover:scale-[1.02] md:px-8 md:py-4 md:text-xl"
                  >
                    <img
                      src={HelloHilaryLogo192}
                      alt="Doddy"
                      className="h-8 w-8"
                    />
                    Let Doddy Pick the Reels!
                  </button>
                </div>
              </div>
            </section>

            <section className="mb-16">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="text-center md:text-left">
                  <button
                    onClick={refreshGallery}
                    className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white/90 px-4 py-2 text-sm font-semibold text-pink-700 shadow-sm transition hover:bg-pink-50"
                  >
                    ↻ Refresh Gallery
                  </button>

                  <p className="mt-3 text-lg font-semibold text-pink-700">
                    Showing {filteredVideos.length} video
                    {filteredVideos.length === 1 ? "" : "s"}
                  </p>
                </div>

                {activeFilterCount > 0 ? (
                  <div className="flex flex-col items-center gap-3 sm:flex-row">
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
                      className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 font-bold text-white shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      ▶ Play These Videos
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-center md:justify-end">
                    <a
                      href="#photos"
                      className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white/90 px-4 py-2 text-sm font-semibold text-pink-700 shadow-sm transition hover:bg-pink-50"
                    >
                      Go to Photos
                      <span aria-hidden="true">↓</span>
                    </a>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {filteredVideos.map((v) => (
                  <VideoCard
                    key={v.id}
                    video={v}
                    thumbnailUrl={videoThumbUrls[v.id]}
                    onPlay={() =>
                      playVideo(
                        v.playback_key || v.original_key,
                        v.title,
                        videoThumbUrls[v.id] || "",
                      )
                    }
                    onDelete={handleDeleteVideo}
                    onEdit={handleOpenEdit}
                  />
                ))}
              </div>
            </section>

            <section id="photos" className="scroll-mt-24">
              <h2 className="mb-6 text-center text-3xl font-bold text-pink-700">
                Photos
              </h2>

              {photos.length > 0 ? (
                <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl shadow-xl">
                  <Swiper
                    modules={[Pagination, Navigation, Autoplay]}
                    slidesPerView={1}
                    loop={photos.length > 1}
                    autoplay={{ delay: 7000, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    navigation
                    className="h-[360px] sm:h-[420px] md:h-[520px]"
                  >
                    {photos.map((p, index) => (
                      <SwiperSlide key={p.id}>
                        <div
                          className="relative h-full w-full cursor-pointer bg-black"
                          onClick={() => openPhotoViewer(p)}
                        >
                          {photoUrls[p.id] && !photoLoadFailed[p.id] ? (
                            <img
                              src={photoUrls[p.id]}
                              alt={p.title || "Photo"}
                              className="h-full w-full object-cover object-top"
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
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-200 to-blue-200">
                              <div className="px-6 text-center">
                                <div className="text-xl font-semibold text-white drop-shadow">
                                  {p.title || "Photo"}
                                </div>
                                <div className="mt-2 text-white/90 drop-shadow">
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
                <div className="rounded-3xl bg-white/75 p-12 text-center shadow-lg backdrop-blur-sm">
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={closePhotoViewer}
          >
            <div
              className="w-full max-w-4xl overflow-hidden rounded-[2rem] border-4 border-pink-200 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.28)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-pink-100 bg-gradient-to-r from-pink-100 via-rose-50 to-blue-100 px-5 py-4">
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
                  className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-2.5 text-base font-bold text-white shadow-lg transition hover:scale-[1.02]"
                >
                  Close ✕
                </button>
              </div>

              <div className="relative flex justify-center bg-black">
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={goToPreviousPhoto}
                      className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/85 px-4 py-2 text-xl font-bold text-pink-700 shadow-lg transition hover:bg-white"
                    >
                      ‹
                    </button>

                    <button
                      onClick={goToNextPhoto}
                      className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/85 px-4 py-2 text-xl font-bold text-pink-700 shadow-lg transition hover:bg-white"
                    >
                      ›
                    </button>
                  </>
                )}

                <img
                  src={photoUrls[selectedPhoto.id]}
                  alt={selectedPhoto.title || "Photo"}
                  className="max-h-[70vh] w-auto object-contain"
                />
              </div>

              <div className="flex flex-col items-center justify-between gap-3 border-t border-pink-100 bg-gradient-to-r from-pink-50 to-blue-50 px-5 py-4 sm:flex-row">
                <div className="text-sm text-gray-700">
                  {selectedPhoto.caption || "No description"}
                </div>

                <button
                  onClick={() => {
                    const canModify =
                      currentUser &&
                      (currentUser.id === selectedPhoto.user_id ||
                        currentUser.role === "admin");
                    if (!canModify) { setShowPhotoPermission(true); return; }
                    setShowPhotoDeleteConfirm(true);
                  }}
                  className="rounded-full bg-red-500 px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-red-600"
                >
                  Delete Photo
                </button>
              </div>
            </div>
          </div>
        )}

        <PermissionModal
          isOpen={showPhotoPermission}
          onClose={() => setShowPhotoPermission(false)}
        />

        <ConfirmModal
          isOpen={showPhotoDeleteConfirm}
          title="Delete this photo?"
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={() => handleDeletePhoto(selectedPhoto?.id)}
          onCancel={() => setShowPhotoDeleteConfirm(false)}
        />

        <SuccessModal
          isOpen={showPhotoDeleteSuccess}
          title="Deleted"
          message="The photo was deleted."
          onClose={() => setShowPhotoDeleteSuccess(false)}
        />

        <SuccessModal
          isOpen={showVideoDeleteSuccess}
          title="Deleted"
          message="The video was deleted."
          onClose={() => setShowVideoDeleteSuccess(false)}
        />

        <VideoPlayerModal
          isOpen={playerOpen}
          title={playerTitle}
          url={playerUrl}
          poster={playerPoster}
          videoLoading={videoLoading}
          playlistActive={playlistActive}
          playlistIndex={playlistIndex}
          playlistLength={playlist.length}
          onClose={closePlayer}
          onLoadedData={(e) => {
            setVideoLoading(false);
            e.currentTarget.play().catch(() => {});
          }}
          onEnded={handleVideoEnd}
          onNext={handleNextVideo}
          onPrev={goToPrevious}
        />

        <EditVideoModal
          isOpen={showEditModal}
          video={editingVideo}
          formData={editForm}
          setFormData={setEditForm}
          onClose={handleCloseEdit}
          onSave={handleSaveEdit}
          isSaving={isSavingEdit}
          categoryOptions={MEDIA_CATEGORIES}
        />
      </div>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-24 right-6 z-50 rounded-full bg-white/80 p-3 text-pink-500 shadow-lg backdrop-blur-sm transition hover:bg-white hover:text-pink-700"
        aria-label="Back to top"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}
