import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ProgressSpinner } from "primereact/progressspinner";

export function Loading() {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) return null;

  return createPortal(
    <div
      className="fixed top-0 left-0 w-full h-full flex align-items-center justify-content-center"
      style={{ zIndex: 99999 }}
    >
      <div
        className="absolute top-0 left-0 w-full h-full"
        style={{ backdropFilter: "blur(4px)" }}
      />
      <ProgressSpinner
        className="relative"
        style={{ width: "50px", height: "50px" }}
        strokeWidth="8"
        fill="transparent"
        animationDuration=".5s"
      />
    </div>,
    portalRoot,
  );
}

export default Loading;
