// src/pages/Gallery.jsx
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// Placeholder data (replace with real fetch from backend later)
const placeholderPhotos = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    caption: "Sunrise from the garden – thinking of you!",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
    caption: "Puppy cuddles today 💕",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800",
    caption: "Family picnic memories",
  },
];

const placeholderVideos = [
  {
    id: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
    caption: "Short hello song",
    from: "Aunt Jane",
    duration: "28s",
  },
  {
    id: 2,
    thumbnail:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
    caption: "Story time with Dad",
    from: "Dad",
    duration: "45s",
  },
  {
    id: 3,
    thumbnail:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400",
    caption: "Singing lullaby",
    from: "Mom",
    duration: "35s",
  },
  {
    id: 4,
    thumbnail:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
    caption: "Quick wave hello",
    from: "Uncle Mike",
    duration: "15s",
  },
  {
    id: 5,
    thumbnail:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
    caption: "Bedtime story",
    from: "Grandma",
    duration: "52s",
  },
];

export default function Gallery() {
  return (
    <div className="min-h-screen pt-20 px-6 pb-16 bg-gradient-to-b from-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-pink-800 mb-10 text-center">
          Hello Hilary Gallery 💕
        </h1>

        {/* Photo Carousel Section – smaller and less dominant */}
        <section className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-pink-700 mb-6 text-center">
            Recent Photos
          </h2>

          {placeholderPhotos.length > 0 ? (
            <div className="relative rounded-2xl overflow-hidden shadow-xl mx-auto max-w-4xl">
              <Swiper
                modules={[Pagination, Navigation, Autoplay]}
                spaceBetween={0}
                slidesPerView={1}
                centeredSlides
                loop={placeholderPhotos.length > 1}
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
                className="h-[200px] sm:h-[300px] md:h-[400px]" // ← smaller height
              >
                {placeholderPhotos.map((photo) => (
                  <SwiperSlide key={photo.id}>
                    <div className="relative h-full w-full group">
                      <img
                        src={photo.url}
                        alt={photo.caption}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <p className="text-white text-lg md:text-xl font-medium drop-shadow-lg">
                          {photo.caption}
                        </p>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Custom arrows – large touch targets */}
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
                No photos yet — upload one to brighten Hilary's day! 📸
              </p>
            </div>
          )}
        </section>

        {/* Video Grid Section – made more prominent */}
        <section>
          <h2 className="text-4xl md:text-5xl font-bold text-pink-800 mb-10 text-center">
            Hello Videos
          </h2>

          {placeholderVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {placeholderVideos.map((video) => (
                <div
                  key={video.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer 
                             hover:shadow-2xl hover:scale-[1.02] transition duration-300 group"
                >
                  <div className="relative aspect-video bg-gray-200">
                    <img
                      src={video.thumbnail}
                      alt={video.caption}
                      className="w-full h-full object-cover transition group-hover:brightness-90"
                    />
                    {/* Bigger, more obvious play icon */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-90 group-hover:opacity-100 transition">
                      <svg
                        className="h-20 w-20 md:h-28 md:w-28 text-white drop-shadow-2xl"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    {/* Small "Video" badge */}
                    <div className="absolute top-3 right-3 bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                      Video
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-pink-700 transition">
                      {video.caption}
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                      From {video.from} • {video.duration}
                    </p>
                  </div>
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

          <div className="mt-16 text-center">
            <button className="bg-pink-500 text-white text-2xl md:text-3xl font-semibold py-6 px-12 md:px-16 rounded-full shadow-xl hover:bg-pink-600 transition">
              Play All (Shuffled)
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
