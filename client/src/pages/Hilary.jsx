import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import PhotoLightbox from "@/components/PhotoLightbox";

import HilaryMainPhoto from "../assets/HilPeach.jpg";
import FallingHeartsOverlay from "../components/FallingHeartsOverlay";
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
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

  const [showPhotoDeleteConfirm, setShowPhotoDeleteConfirm] = useState(false);
  const [showPhotoDeleteSuccess, setShowPhotoDeleteSuccess] = useState(false);
  const [showVideoDeleteSuccess, setShowVideoDeleteSuccess] = useState(false);

  const photoSwiperRef = useRef(null);

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
        if (cancelled) return;

        setMedia(mediaItems);

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

  const closePlayer = () => {
    setPlayerOpen(false);
    setPlayerUrl("");
    setPlayerTitle("");
    setPlayerPoster("");
    setVideoLoading(false);
  };

  const openPhotoViewer = (index) => {
    setSelectedPhotoIndex(index);
    setPhotoViewerOpen(true);
  };

  const closePhotoViewer = () => {
    setSelectedPhotoIndex(null);
    setPhotoViewerOpen(false);
    setShowPhotoDeleteConfirm(false);
  };

  const goToNextPhoto = () => {
    if (!photos.length || selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const goToPreviousPhoto = () => {
    if (!photos.length || selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
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

  const handleDeletePhoto = async (id) => {
    if (!id) return;

    try {
      const res = await fetch(`/api/media/${id}`, {
        method: "DELETE",
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
      closePhotoViewer();
      setShowPhotoDeleteSuccess(true);
    } catch (e) {
      alert(e.message || "Failed to delete photo");
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
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-blue-50 px-4 pb-16 pt-20 sm:px-6">
      <FallingHeartsOverlay count={14} />

      <div className="mx-auto max-w-7xl">
        <div className="relative mb-16">
          <div className="grid items-start gap-12 md:grid-cols-2">
            <div className="text-center">
              <img
                src={HilaryMainPhoto}
                alt="Hilary smiling warmly"
                className="mx-auto mb-6 h-48 w-48 rounded-full border-8 border-pink-200 object-cover shadow-2xl md:h-64 md:w-64"
              />

              <h1 className="mb-4 text-5xl font-bold text-pink-800 md:text-6xl">
                Hilary&apos;s Page 💕
              </h1>

              <p className="mx-auto max-w-md text-xl text-gray-700 md:text-2xl">
                See what Hilary&apos;s been up to!
              </p>
            </div>

            <div>
              <h2 className="mb-6 text-center text-2xl font-bold text-pink-700 md:text-left md:text-3xl">
                Featured Videos
              </h2>

              {featuredVideos.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {featuredVideos.map((video) => (
                    <button
                      key={video.id}
                      type="button"
                      onClick={() =>
                        playVideo(
                          video.playback_key || video.original_key,
                          video.title,
                          videoThumbUrls[video.id] || "",
                        )
                      }
                      className="group w-full"
                    >
                      <div className="relative overflow-hidden rounded-2xl shadow-lg">
                        <img
                          src={videoThumbUrls[video.id]}
                          alt={video.title || "Featured video"}
                          className="h-32 w-full object-cover transition group-hover:scale-105 sm:h-40"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-10 flex justify-center md:justify-end">
          <a
            href="#photos"
            className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white/90 px-4 py-2 text-sm font-semibold text-pink-700 shadow-sm transition hover:bg-pink-50"
          >
            Go to Photos
            <span aria-hidden="true">↓</span>
          </a>
        </div>

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
            <section className="mb-16">
              {regularVideos.length > 0 ? (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
                <div className="rounded-3xl bg-white/75 p-12 text-center shadow-lg backdrop-blur-sm">
                  <p className="text-xl text-gray-600">
                    No videos on Hilary&apos;s page yet 💕
                  </p>
                </div>
              )}
            </section>

            <section id="photos" className="scroll-mt-24">
              <h2 className="mb-6 text-center text-3xl font-bold text-pink-700">
                Photos
              </h2>

              {photos.length > 0 ? (
                <div className="mx-auto max-w-5xl">
                  <div className="relative overflow-hidden rounded-3xl bg-black shadow-2xl">
                    <Swiper
                      modules={[Pagination, Autoplay]}
                      onSwiper={(swiper) => {
                        photoSwiperRef.current = swiper;
                      }}
                      slidesPerView={1}
                      loop={photos.length > 1}
                      autoplay={
                        photos.length > 1
                          ? { delay: 7000, disableOnInteraction: false }
                          : false
                      }
                      pagination={
                        photos.length > 1 ? { clickable: true } : false
                      }
                      className="h-[360px] sm:h-[430px] md:h-[540px]"
                    >
                      {photos.map((p, index) => (
                        <SwiperSlide key={p.id}>
                          <div
                            className="relative h-full w-full cursor-pointer bg-black"
                            onClick={() => openPhotoViewer(index)}
                          >
                            {photoUrls[p.id] && !photoLoadFailed[p.id] ? (
                              <img
                                src={photoUrls[p.id]}
                                alt={p.title || "Photo"}
                                className="h-full w-full object-contain"
                                onError={() => {
                                  setPhotoLoadFailed((prev) => ({
                                    ...prev,
                                    [p.id]: true,
                                  }));
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

                    {photos.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => photoSwiperRef.current?.slidePrev()}
                          className="absolute left-4 top-1/2 z-[100] -translate-y-1/2 rounded-full bg-white px-5 py-3 text-3xl font-bold text-pink-700 shadow-2xl"
                        >
                          ‹
                        </button>

                        <button
                          type="button"
                          onClick={() => photoSwiperRef.current?.slideNext()}
                          className="absolute right-4 top-1/2 z-[100] -translate-y-1/2 rounded-full bg-white px-5 py-3 text-3xl font-bold text-pink-700 shadow-2xl"
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl bg-white/75 p-12 text-center shadow-lg backdrop-blur-sm">
                  <p className="text-xl text-gray-600">No photos yet 📸</p>
                </div>
              )}
            </section>
          </>
        )}

        <div className="mt-16 text-center">
          <Link
            to="/upload"
            className="inline-block rounded-full bg-purple-500 px-12 py-6 text-2xl font-semibold text-white shadow-xl transition hover:bg-pink-400"
          >
            Add a Hilary Moment 💖
          </Link>
        </div>

        <PhotoLightbox
          isOpen={photoViewerOpen}
          photos={photos}
          selectedIndex={selectedPhotoIndex}
          photoUrls={photoUrls}
          onClose={closePhotoViewer}
          onPrev={goToPreviousPhoto}
          onNext={goToNextPhoto}
          showDelete={true}
          onDelete={(id) => {
            setShowPhotoDeleteConfirm(true);
          }}
        />

        <ConfirmModal
          isOpen={showPhotoDeleteConfirm}
          title="Delete this photo?"
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={() => handleDeletePhoto(photos[selectedPhotoIndex]?.id)}
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
