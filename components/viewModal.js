"use client";
import { useEffect } from "react";

export default function VideoModal({ gdriveId, onClose }) {
  useEffect(() => {
    const disableContext = (e) => e.preventDefault();
    document.addEventListener("contextmenu", disableContext);
    return () => document.removeEventListener("contextmenu", disableContext);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div className="relative w-[90%] max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">
        <button
          className="absolute top-1 right-2 text-white text-2xl z-10 hover:text-gray-100"
          onClick={onClose}
        >
          ✖
        </button>
        <div className="w-full h-[60vh]">
          <iframe
            src={`https://drive.google.com/file/d/${gdriveId}/preview`}
            className="w-full h-full"
            allow="autoplay; encrypted-media"
            sandbox="allow-scripts allow-same-origin"
            allowFullScreen
            frameBorder="0"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
