export default function ConfirmModal({
  isOpen,
  title = "Are you sure?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  confirmClassName = "bg-red-500 text-white",
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] border-4 border-pink-200 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.28)]">
        <div className="flex items-center justify-between border-b border-pink-100 bg-gradient-to-r from-pink-100 via-rose-50 to-blue-100 px-6 py-5">
          <h3 className="text-xl font-bold text-pink-800">{title}</h3>

          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-gray-600 hover:bg-white hover:text-gray-900 transition"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full bg-gray-100 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-200 transition"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className={`rounded-full px-6 py-3 font-bold shadow transition hover:scale-[1.02] ${confirmClassName}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
