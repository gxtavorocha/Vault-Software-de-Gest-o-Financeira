import { useState, useRef, useEffect } from "react";
import { categoryService } from "../services/categoryService";
// ── Extrai o próximo ID seguro a partir dos dados existentes ──────────────────
// BUG CORRIGIDO #4: nextCatId usava useRef(500) que reiniciava a cada reload,
// podendo gerar categorias com IDs duplicados (ex: "c_500") caso já existissem
// categorias salvas com esse mesmo ID no localStorage.
const getNextCatId = (categories) => {
  if (!categories.length) return 500;
  const nums = categories
    .map((c) => {
      const match = String(c.id).match(/^c_(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !isNaN(n));
  return nums.length > 0 ? Math.max(...nums) + 1 : 500;
};

// ════════════════════════════════════════════════════════════════════════════
export function useCategories() {
  const [categories, setCategories] = useState(categoryService.getAll);

  useEffect(() => {
    categoryService.saveAll(categories);
  }, [categories]);

  // Inicializa o contador a partir dos dados já existentes no localStorage
  const nextCatId = useRef(getNextCatId(categories));

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