import { useEffect } from "react";

export function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function setMeta(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(url) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = url;
}

function setJsonLd(id, data) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export function usePageMeta({ title, description, ogTitle, ogDescription, canonical, jsonLd }) {
  useEffect(() => {
    document.title = title;
    setMeta("name", "description", description);
    setMeta("property", "og:title", ogTitle || title);
    setMeta("property", "og:description", ogDescription || description);
    setMeta("property", "og:url", canonical);
    setMeta("property", "og:image", "https://durbolt.com/og-image.jpg");
    setMeta("name", "twitter:title", ogTitle || title);
    setMeta("name", "twitter:description", ogDescription || description);
    setCanonical(canonical);
    if (jsonLd) setJsonLd("page-jsonld", jsonLd);
    return () => {
      document.getElementById("page-jsonld")?.remove();
    };
  }, [title, description, canonical]);
}
