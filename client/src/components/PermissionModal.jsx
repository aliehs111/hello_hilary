export default function PermissionModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.28)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-pink-100 via-rose-50 to-blue-100 px-6 py-5">
          <h2 className="text-xl font-bold text-pink-800">Permission Required</h2>
        </div>

        <div className="px-6 py-6">
          <p className="text-gray-700 text-base leading-relaxed">
            Only the person who uploaded this can edit or delete it. If you think
            there's an issue with this video, please email{" "}
            <a
              href="mailto:sheila@hello-hilary.com"
              className="text-pink-600 underline hover:text-pink-700"
            >
              sheila@hello-hilary.com
            </a>
          </p>
        </div>

        <div className="border-t border-pink-100 bg-gradient-to-r from-pink-50 to-blue-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-8 py-2.5 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02]"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
