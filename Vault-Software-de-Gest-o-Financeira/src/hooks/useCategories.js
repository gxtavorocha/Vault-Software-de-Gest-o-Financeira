import { useState, useRef } from "react";
import { LS_CAT, loadCat } from "../constants";
import { useLocalStorage } from "./useLocalStorage";

// ════════════════════════════════════════════════════════════════════════════
export function useCategories() {
  const nextCatId = useRef(500);

  const [categories, setCategories] = useLocalStorage(LS_CAT, loadCat);
  const [catForm, setCatForm] = useState({
    label: "",
    icon: "✦",
    color: "#E8B86D",
  });

  // ── Handlers ────────────────────────────────────────────────────────────────

  const getCat = (id) => categories.find((c) => c.id === id);

  const addCat = () => {
    if (!catForm.label.trim()) return false;
    setCategories((prev) => [
      ...prev,
      { ...catForm, id: "c_" + nextCatId.current++, custom: true },
    ]);
    setCatForm({ label: "", icon: "✦", color: "#E8B86D" });
    return true;
  };

  const removeCat = (id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    return true;
  };

  // ── Retorno ──────────────────────────────────────────────────────────────────

  return {
    categories,
    catForm,
    setCatForm,
    getCat,
    addCat,
    removeCat,
  };
}
