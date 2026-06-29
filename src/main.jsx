import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import ProductPage from "./pages/ProductPage.jsx";
import DivisionPage from "./pages/DivisionPage.jsx";
import SolutionsPage from "./pages/SolutionsPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import DatasheetPage from "./pages/DatasheetPage.jsx";
import BlogPage from "./pages/BlogPage.jsx";
import ArticlePage from "./pages/ArticlePage.jsx";
import RedesignPreview from "./pages/RedesignPreview.jsx";
import { useTracker } from "./utils/tracker.js";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return null;
}

function TrackingWrapper() {
  useTracker();
  return null;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <TrackingWrapper />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/solutions" element={<SolutionsPage />} />
        <Route path="/products/:slug" element={<ProductPage />} />
        <Route path="/divisions/:slug" element={<DivisionPage />} />
        <Route path="/drblt-ops" element={<AdminPage />} />
        <Route path="/datasheets/:slug" element={<DatasheetPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<ArticlePage />} />
        <Route path="/redesign-preview" element={<RedesignPreview />} />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
