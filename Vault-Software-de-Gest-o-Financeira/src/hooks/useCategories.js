import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { categoryService } from "../services/categoryService";

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

export function useCategories() {
  const [categories, setCategories] = useState(categoryService.getAll);

  useEffect(() => {
    categoryService.saveAll(categories);
  }, [categories]);

  const nextCatId = useRef(getNextCatId(categories));

  const getCat = useCallback((id) => categories.find((c) => c.id === id), [categories]);

  const addCat = useCallback((formParams) => {
    const newId = "c_" + nextCatId.current++;
    setCategories((prev) => [
      ...prev,
      { ...formParams, id: newId, custom: true },
    ]);
    return true;
  }, []);

  const removeCat = useCallback((id) => {
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