import { useEffect, useState } from "react";

export default function AdminMedia() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [view, setView] = useState("featured");

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      setLoading(true);
      setErr("");

      const res = await fetch("/api/media");
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
    filteredMedia = media.filter((m) => m.is_featured);
  } else if (view === "hilary") {
    filteredMedia = media.filter((m) => m.is_hilary_page);
  } else if (view === "all") {
    filteredMedia = media;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-blue-50 px-6 pt-20 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-pink-800">
            Admin Media CMS ⚙️
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Manage featured stories, Hilary page media, and cleanup.
          </p>
        </div>

        <div className="flex justify-end mb-6">
          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm bg-white"
          >
            <option value="featured">Featured Stories</option>
            <option value="hilary">Hilary Page</option>
            <option value="all">All Media</option>
          </select>
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

                    <td className="px-4 py-4 text-gray-700">
                      {item.media_type}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          item.is_hilary_page
                            ? "bg-pink-100 text-pink-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.is_hilary_page ? "Yes" : "No"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <button
                        onClick={() =>
                          updateMedia(item.id, {
                            is_featured: !item.is_featured,
                            ...(item.is_featured
                              ? {}
                              : { is_hilary_page: true }),
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
