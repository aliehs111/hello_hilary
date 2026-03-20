// src/components/EditVideoModal.jsx

import { MEDIA_CATEGORIES } from "@/constants/mediaCategories";

export default function EditVideoModal({
  isOpen,
  video,
  formData,
  setFormData,
  onClose,
  onSave,
  isSaving = false,
  categoryOptions = [],
}) {
  if (!isOpen || !video) return null;

  const toggleCategory = (category) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        className="w-full max-w-2xl rounded-[2rem] bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-pink-100 bg-gradient-to-r from-pink-100 via-rose-50 to-blue-100 px-6 py-4">
          <h3 className="text-2xl font-bold text-pink-800">Edit Video</h3>
          <p className="mt-1 text-sm text-gray-600">
            Update the title, caption, and categories.
          </p>
        </div>

        <div className="space-y-6 px-6 py-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="Enter a title"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Caption
            </label>
            <textarea
              rows={4}
              value={formData.caption}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  caption: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="Write a short caption"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-700">
              Categories
            </label>

            <div className="flex flex-wrap gap-3">
              {categoryOptions.map((category) => {
                const selected = formData.categories.includes(category);

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      selected
                        ? "bg-pink-500 text-white shadow"
                        : "bg-pink-50 text-pink-700 hover:bg-pink-100"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-pink-100 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-2.5 font-semibold text-white shadow transition hover:scale-[1.01] disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
