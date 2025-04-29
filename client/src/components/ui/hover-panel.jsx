// components/AddPatientPanel.jsx
import { useRef, useEffect } from "react";
import { X } from "lucide-react";
import clsx from "clsx";
import { useHoverPanel } from "../../context/HoverPanelContext";

export default function HoverPanel() {
  const { isOpen, title, content, closePanel } = useHoverPanel();
    const panelRef = useRef(null);

   // Focus trap and escape key handling
   useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        closePanel(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Focus the panel when opened
      if (panelRef.current) {
        panelRef.current.focus();
      }
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, closePanel]);

  const handleBackgroundClick = (e) => {
    if (e.target.id === "backdrop") {
      closePanel(false); // just hide, don't reset
    }
  };

  if (!isOpen && !content) return null;

  return (
<div
  id="backdrop"
  onClick={handleBackgroundClick}
  className={clsx(
    "fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 flex justify-end m-0",
    isOpen ? "visible opacity-100" : "invisible opacity-0"
  )}

  aria-modal={isOpen}
  role="dialog"
  aria-labelledby="panel-title"
>

      <div
       ref={panelRef}
       tabIndex={-1}
        className={clsx(
          "relative m-4 h-[calc(100%-2rem)] w-[90vw] max-w-xl bg-white rounded-2xl shadow-xl transition-transform duration-30 flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        
        <div className="flex justify-between items-center p-4 border-b sticky top-0 rounded-t-lg z-10">
  <h2 id="panel-title" className="text-lg font-semibold">{title}</h2>
  <button 
   onClick={() => closePanel(true)}
    className="p-1 rounded-full hover:bg-gray-100"
    aria-label="Close panel"
  >
    <X className="w-5 h-5 text-gray-500 hover:text-black" />
  </button>
</div>

    <div className="p-4 overflow-y-auto flex-grow">
      {content}
    </div>
  </div>
</div>
);
}