import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function AdminMedia() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [view, setView] = useState("all");
  const [uploaderSearch, setUploaderSearch] = useState("");
  const [titleSearch, setTitleSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("any");
  const [mediaTypeFilter, setMediaTypeFilter] = useState("all");

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      setLoading(true);
      setErr("");

      const res = await fetch("/api/media", { credentials: "include" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data?.error || "Failed to load media");

      setMedia(data.media || []);
    } catch (e) {
      setErr(e.message || "Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  const updateMedia = async (id, updates) => {
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data?.error || "Update failed");

      setMedia((prev) =>
        prev.map((item) => (item.id === id ? data.media : item)),
      );
    } catch (e) {
      alert(e.message || "Update failed");
    }
  };

  const deleteMedia = async (id) => {
    const confirmed = window.confirm("Delete this media item?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/media/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data?.error || "Delete failed");

      setMedia((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      alert(e.message || "Delete failed");
    }
  };

  let filteredMedia = media;

  if (view === "featured") {
    filteredMedia = filteredMedia.filter((m) => m.is_featured);
  } else if (view === "hilary") {
    filteredMedia = filteredMedia.filter((m) => m.is_hilary_page);
  }

  if (uploaderSearch.trim()) {
    const q = uploaderSearch.trim().toLowerCase();
    filteredMedia = filteredMedia.filter((m) =>
      (m.display_name || "").toLowerCase().includes(q),
    );
  }

  if (titleSearch.trim()) {
    const q = titleSearch.trim().toLowerCase();
    filteredMedia = filteredMedia.filter((m) =>
      (m.title || "").toLowerCase().includes(q),
    );
  }

  if (dateFilter !== "any") {
    const now = new Date();

    filteredMedia = filteredMedia.filter((m) => {
      if (!m.created_at) return false;

      const createdAt = new Date(m.created_at);
      const diffMs = now - createdAt;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (dateFilter === "today") return diffDays <= 1;
      if (dateFilter === "week") return diffDays <= 7;
      if (dateFilter === "month") return diffDays <= 30;

      return true;
    });
  }

  if (mediaTypeFilter !== "all") {
    filteredMedia = filteredMedia.filter(
      (m) => m.media_type === mediaTypeFilter,
    );
  }

  filteredMedia = [...filteredMedia].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-blue-50 px-6 pt-20 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex items-start justify-between">
          <div className="text-center flex-1">
            <h1 className="text-4xl md:text-5xl font-bold text-pink-800">
              Admin Media CMS ⚙️
            </h1>
            <p className="mt-3 text-lg text-gray-600">
              Manage featured videos, Hilary page media, and cleanup.
            </p>
          </div>
          <Link
            to="/admin/users"
            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition whitespace-nowrap"
          >
            User Management →
          </Link>
        </div>

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                View
              </label>
              <select
                value={view}
                onChange={(e) => setView(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm"
              >
                <option value="featured">Featured Videos</option>
                <option value="hilary">Hilary Page</option>
                <option value="all">All Media</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Uploader
              </label>
              <input
                type="text"
                value={uploaderSearch}
                onChange={(e) => setUploaderSearch(e.target.value)}
                placeholder="Search uploader"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Title
              </label>
              <input
                type="text"
                value={titleSearch}
                onChange={(e) => setTitleSearch(e.target.value)}
                placeholder="Search title"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Date
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm"
              >
                <option value="any">Any time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Type
              </label>
              <select
                value={mediaTypeFilter}
                onChange={(e) => setMediaTypeFilter(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm"
              >
                <option value="all">All</option>
                <option value="video">Videos</option>
                <option value="photo">Photos</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setView("all");
              setUploaderSearch("");
              setTitleSearch("");
              setDateFilter("any");
              setMediaTypeFilter("all");
            }}
            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>

        {loading && (
          <div className="bg-white rounded-3xl shadow-lg p-10 text-center">
            <p className="text-lg text-gray-600">Loading media…</p>
          </div>
        )}

        {!loading && err && (
          <div className="bg-red-100 border border-red-300 text-red-800 rounded-3xl p-6 text-center shadow-lg">
            {err}
          </div>
        )}

        {!loading && !err && (
          <div className="overflow-x-auto bg-white rounded-3xl shadow-xl">
            <table className="min-w-full text-sm">
              <thead className="bg-pink-100 text-pink-900">
                <tr>
                  <th className="px-4 py-4 text-left">Title</th>
                  <th className="px-4 py-4 text-left">Uploader</th>
                  <th className="px-4 py-4 text-left">Type</th>
                  <th className="px-4 py-4 text-left">Hilary Page</th>
                  <th className="px-4 py-4 text-left">Featured</th>
                  <th className="px-4 py-4 text-left">Hidden</th>
                  <th className="px-4 py-4 text-left">Created</th>
                  <th className="px-4 py-4 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredMedia.map((item) => (
                  <tr key={item.id} className="border-t border-gray-100">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-gray-900">
                        {item.title || "(untitled)"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 break-all">
                        {item.id}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-gray-700">
                      {item.display_name || "Unknown"}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          item.media_type === "video"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {item.media_type === "video" ? "🎬 Video" : "📸 Photo"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <button
                        onClick={() =>
                          updateMedia(item.id, {
                            is_hilary_page: !item.is_hilary_page,
                          })
                        }
                        className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                          item.is_hilary_page
                            ? "bg-pink-500 text-white hover:bg-pink-600"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {item.is_hilary_page ? "Yes" : "No"}
                      </button>
                    </td>

                    <td className="px-4 py-4">
                      <button
                        onClick={() =>
                          updateMedia(item.id, {
                            is_featured: !item.is_featured,
                          })
                        }
                        className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                          item.is_featured
                            ? "bg-yellow-400 text-white hover:bg-yellow-500"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {item.is_featured ? "Featured" : "Not Featured"}
                      </button>
                    </td>

                    <td className="px-4 py-4">
                      <button
                        onClick={() =>
                          updateMedia(item.id, {
                            is_hidden: !item.is_hidden,
                          })
                        }
                        className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                          item.is_hidden
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {item.is_hidden ? "Hidden" : "Visible"}
                      </button>
                    </td>

                    <td className="px-4 py-4 text-gray-600">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-4">
                      <button
                        onClick={() => deleteMedia(item.id)}
                        className="rounded-full bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredMedia.length === 0 && (
              <div className="p-10 text-center text-gray-600">
                No media found for this view.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
