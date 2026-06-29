import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

function getSessionId() {
  let id = sessionStorage.getItem("_drblt_sid");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("_drblt_sid", id);
  }
  return id;
}

function isNewVisitor() {
  const key = "_drblt_v";
  if (localStorage.getItem(key)) return false;
  localStorage.setItem(key, "1");
  return true;
}

// Hook: fires a POST to /api/track on every route change.
// Skips the admin route to avoid self-tracking.
export function useTracker() {
  const location = useLocation();
  const isNewRef = useRef(isNewVisitor());

  useEffect(() => {
    if (location.pathname.startsWith("/drblt-ops")) return;

    const payload = {
      page: location.pathname + (location.search || ""),
      referrer: document.referrer || "",
      sessionId: getSessionId(),
      isNew: isNewRef.current,
    };
    isNewRef.current = false; // only true on the very first page of session

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }, [location.pathname, location.search]);
}
