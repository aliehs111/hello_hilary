export default function SuccessModal({
  isOpen,
  title = "Done",
  message = "Success",
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] border-4 border-pink-200 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.28)]">
        <div className="flex items-center justify-between border-b border-pink-100 bg-gradient-to-r from-pink-100 via-rose-50 to-blue-100 px-6 py-5">
          <h3 className="text-xl font-bold text-pink-800">{title}</h3>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-gray-600 hover:bg-white hover:text-gray-900 transition"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-8 text-center">
          <div className="mb-3 text-5xl">✅</div>
          <p className="text-lg font-semibold text-gray-800">{message}</p>

          <button
            type="button"
            onClick={onClose}
            className="mt-6 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-3 font-bold text-white shadow hover:scale-[1.02] transition"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
