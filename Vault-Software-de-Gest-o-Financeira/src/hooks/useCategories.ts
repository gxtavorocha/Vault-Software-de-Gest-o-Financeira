import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { DEFAULT_CATEGORIES } from "../constants";
import { categoryService } from "../services/categoryService";
import type { Category, CategoryForm } from "../types/finance";

const getNextCatId = (categories: Category[]): number => {
  if (!categories.length) return 500;
  const nums = categories
    .map((c) => {
      const match = String(c.id).match(/^c_(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !isNaN(n));
  return nums.length > 0 ? Math.max(...nums) + 1 : 500;
};

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(categoryService.getAll);

  useEffect(() => {
    categoryService.saveAll(categories);
  }, [categories]);

  const nextCatId = useRef(getNextCatId(categories));

  const fallbackCategory = useMemo(
    () =>
      categories.find((category) => String(category?.id) === "outros") ??
      DEFAULT_CATEGORIES.find((category) => category.id === "outros") ?? {
        id: "outros",
        label: "Outros",
        icon: "outros",
        color: "#E8986D",
        custom: false,
      },
    [categories],
  );

  const getCat = useCallback(
    (id: string | number | null | undefined) => {
      if (id == null || id === "") return fallbackCategory;
      return (
        categories.find((category) => String(category?.id) === String(id)) ??
        fallbackCategory
      );
    },
    [categories, fallbackCategory],
  );

  const addCat = useCallback((formParams: CategoryForm) => {
    const newId = "c_" + nextCatId.current++;
    setCategories((prev) => [
      ...prev,
      { ...formParams, id: newId, custom: true },
    ]);
    return true;
  }, []);

  const removeCat = useCallback((id: Category["id"]) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    return true;
  }, []);

  return useMemo(() => ({
    categories,
    getCat,
    addCat,
    removeCat,
  }), [categories, getCat, addCat, removeCat]);
}
