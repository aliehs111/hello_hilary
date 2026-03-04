// src/pages/Upload.jsx
import { useMemo, useState } from "react";

function getKindFromFile(file) {
  return file.type.startsWith("video/") ? "video" : "photo";
}

export default function Upload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState(""); // maps to caption
  const [category, setCategory] = useState(""); // optional if you want it now
  const [statusMessage, setStatusMessage] = useState("");
  const [status, setStatus] = useState(""); // 'success', 'error', or ''
  const [loading, setLoading] = useState(false);

  const fileKind = useMemo(() => (file ? getKindFromFile(file) : null), [file]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        !selectedFile.type.startsWith("image/") &&
        !selectedFile.type.startsWith("video/")
      ) {
        setStatus("error");
        setStatusMessage("Please select a photo or video file.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setStatus("");
      setStatusMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setStatus("error");
      setStatusMessage("Please choose a file to upload.");
      return;
    }

    // You must have a logged-in user id for /api/media/complete
    let userId = null;
    try {
      const stored = localStorage.getItem("user");
      if (stored) userId = JSON.parse(stored)?.id;
    } catch {
      // ignore
    }

    if (!userId) {
      setStatus("error");
      setStatusMessage("Please log in again (missing user session).");
      return;
    }

    setLoading(true);
    setStatus("");
    setStatusMessage("");

    try {
      // 1) Ask server for a presigned S3 upload URL
      const presignRes = await fetch("/api/s3/presign-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: fileKind, // "photo" | "video"
          contentType: file.type, // mime type
          originalFilename: file.name, // optional metadata
        }),
      });

      const presignData = await presignRes.json().catch(() => ({}));

      if (!presignRes.ok) {
        throw new Error(presignData?.error || "Failed to prepare upload.");
      }

      const { uploadUrl, key } = presignData;
      if (!uploadUrl || !key) {
        throw new Error("Presign response missing uploadUrl/key.");
      }

      // 2) Upload directly to S3 (PUT)
      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!putRes.ok) {
        throw new Error("S3 upload failed. Please try again.");
      }

      // 3) Tell backend upload is complete (write DB row)
      const completeRes = await fetch("/api/media/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          media_type: fileKind,
          original_key: key,
          mime_type: file.type,
          size_bytes: file.size,
          title: title || null,
          caption: note || null, // <-- matches your schema
          category: category || null,
          original_filename: file.name,
        }),
      });

      const completeData = await completeRes.json().catch(() => ({}));

      if (!completeRes.ok) {
        throw new Error(
          completeData?.error || "Upload saved but DB record failed.",
        );
      }

      setStatus("success");
      setStatusMessage("Upload successful! Thank you 💕");
      setFile(null);
      setTitle("");
      setNote("");
      setCategory("");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setStatusMessage(err?.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-6 pb-12 flex items-center justify-center bg-gradient-to-b from-pink-50 to-blue-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-pink-800 mb-6 text-center">
          Add Your Hello for Hilary 💕
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          Upload a photo or short video message, song, or story.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              placeholder="Picking daisies in the meadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Message / Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              placeholder="A short note about this hello..."
            />
          </div>

          {/* Optional category field (safe to remove if you don’t want it yet) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category (optional)
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              placeholder="birthday, family, dogs..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Photo or Video File
            </label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0
                file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700
                hover:file:bg-pink-100 cursor-pointer"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)}{" "}
                MB)
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className="w-full bg-pink-500 text-white py-3 px-6 rounded-full font-semibold hover:bg-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>

        {status === "success" && (
          <div className="mt-6 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg text-center">
            {statusMessage}
          </div>
        )}

        {status === "error" && (
          <div className="mt-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg text-center">
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
}
