import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import HilaryMainPhoto from "../assets/HilPeach.jpg";
import SparkleOverlay from "../components/SparkleOverlay";
import VideoCard from "@/components/VideoCard";
import ConfirmModal from "@/components/ConfirmModal";
import SuccessModal from "@/components/SuccessModal";

import VideoPlayerModal from "@/components/VideoPlayerModal";

export default function Hilary() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [photoUrls, setPhotoUrls] = useState({});
  const [photoLoadFailed, setPhotoLoadFailed] = useState({});
  const [videoThumbUrls, setVideoThumbUrls] = useState({});

  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerUrl, setPlayerUrl] = useState("");
  const [playerTitle, setPlayerTitle] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);
  const [playerPoster, setPlayerPoster] = useState("");

  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const [showPhotoDeleteConfirm, setShowPhotoDeleteConfirm] = useState(false);
  const [showPhotoDeleteSuccess, setShowPhotoDeleteSuccess] = useState(false);
  const [showVideoDeleteSuccess, setShowVideoDeleteSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr("");

      try {
        const res = await fetch("/api/media?hilary_page=true");
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

  const featuredVideos = useMemo(
    () => videos.filter((v) => v.is_featured).slice(0, 3),
    [videos],
  );

  const regularVideos = useMemo(
    () => videos.filter((v) => !v.is_featured),
    [videos],
  );

  const playVideo = async (key, title, poster = "") => {
    try {
      setVideoLoading(true);

      const res = await fetch(
        `/api/s3/presign-download?key=${encodeURIComponent(key)}`,
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

  const closePlayer = () => {
    setPlayerOpen(false);
    setPlayerUrl("");
    setPlayerTitle("");
    setPlayerPoster("");
    setVideoLoading(false);
  };

  const openPhotoViewer = (photo) => {
    setSelectedPhoto(photo);
    setPhotoViewerOpen(true);
  };

  const closePhotoViewer = () => {
    setSelectedPhoto(null);
    setPhotoViewerOpen(false);
  };

  const handleDeleteVideo = async (id) => {
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: "DELETE",
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

  useEffect(() => {
    if (!playerOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closePlayer();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [playerOpen]);

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 pb-16 bg-gradient-to-b from-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        <div className="relative mb-16">
          <SparkleOverlay count={14} />

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* HILARY PHOTO + TITLE */}

            <div className="text-center">
              <img
                src={HilaryMainPhoto}
                alt="Hilary smiling warmly"
                className="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover mx-auto mb-6 shadow-2xl border-8 border-pink-200"
              />

              <h1 className="text-5xl md:text-6xl font-bold text-pink-800 mb-4">
                Hilary&apos;s Page 💕
              </h1>

              <p className="text-xl md:text-2xl text-gray-700 max-w-md mx-auto">
                See what Hilary&apos;s been up to!
              </p>
            </div>

            {/* FEATURED VIDEOS */}

            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-pink-700 mb-6 text-center md:text-left">
                Featured Videos
              </h2>

              {featuredVideos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {featuredVideos.map((video) => (
                    <button
                      key={video.id}
                      onClick={() =>
                        playVideo(
                          video.playback_key || video.original_key,
                          video.title,
                          videoThumbUrls[video.id] || "",
                        )
                      }
                      className="group w-full"
                    >
                      <div className="relative rounded-2xl overflow-hidden shadow-lg">
                        <img
                          src={videoThumbUrls[video.id]}
                          alt={video.title || "Featured video"}
                          className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

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
            <section className="mb-16">
              <div className="mb-6 text-center"></div>

              {regularVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {regularVideos.map((v) => (
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
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white/75 backdrop-blur-sm rounded-3xl p-12 text-center shadow-lg">
                  <p className="text-xl text-gray-600">
                    No videos on Hilary&apos;s page yet 💕
                  </p>
                </div>
              )}
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
                              onError={() => {
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

        <div className="mt-16 text-center">
          <Link
            to="/upload"
            className="inline-block bg-purple-500 text-white text-2xl font-semibold py-6 px-12 rounded-full shadow-xl hover:bg-pink-400 transition"
          >
            Add a Hilary Moment 💖
          </Link>
        </div>

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
          onClose={closePlayer}
          onLoadedData={(e) => {
            setVideoLoading(false);
            e.currentTarget.play().catch(() => {});
          }}
        />
      </div>
    </div>
  );
}
