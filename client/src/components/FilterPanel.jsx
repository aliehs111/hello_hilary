// src/components/FilterPanel.jsx
const CATEGORIES = [
  "Just a Hello",
  "Animals",
  "Memories",
  "Music Performance",
  "Singing",
  "Babies and Little People",
  "Reading a Book",
  "Nature",
  "Funny",
  "Creative",
];

export default function FilterPanel({
  isOpen,
  onClose,
  selectedCategories,
  onToggleCategory,
  uploader,
  onChangeUploader,
  uploaderOptions,
  dateRange,
  onChangeDateRange,
  duration,
  onChangeDuration,
  onClear,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/35" onClick={onClose} />

      <aside className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl border-l border-pink-100 flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-pink-100">
          <h2 className="text-2xl font-bold text-pink-700">Filters</h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-gray-800 transition"
            aria-label="Close filters"
            type="button"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wide text-pink-700/70 mb-3">
              Categories
            </h3>

            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => {
                const active = selectedCategories.includes(category);

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => onToggleCategory(category)}
                    className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                      active
                        ? "bg-pink-500 text-white shadow-md"
                        : "bg-pink-50 text-pink-700 hover:bg-pink-100"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold uppercase tracking-wide text-pink-700/70 mb-3">
              Uploaded By
            </h3>

            <select
              value={uploader}
              onChange={(e) => onChangeUploader(e.target.value)}
              className="w-full rounded-2xl border border-pink-100 bg-white px-4 py-3 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              {uploaderOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "Anyone" : option}
                </option>
              ))}
            </select>
          </section>

          <section>
            <h3 className="text-sm font-bold uppercase tracking-wide text-pink-700/70 mb-3">
              Date
            </h3>

            <div className="flex flex-col gap-2">
              {[
                { value: "any", label: "Any time" },
                { value: "week", label: "Last week" },
                { value: "month", label: "Last month" },
                { value: "year", label: "Last year" },
              ].map((option) => {
                const active = dateRange === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onChangeDateRange(option.value)}
                    className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                      active
                        ? "bg-rose-500 text-white shadow-md"
                        : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="border-t border-pink-100 px-6 py-5 flex gap-3">
          <button
            type="button"
            onClick={onClear}
            className="flex-1 rounded-2xl bg-gray-100 text-gray-700 font-semibold py-3 hover:bg-gray-200 transition"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-3 shadow-lg hover:scale-[1.01] transition"
          >
            Done
          </button>
        </div>
      </aside>
    </div>
  );
}
