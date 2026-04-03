import { DEFAULT_CATEGORIES, LS_CAT, loadCat } from "../constants";
import type { Category } from "../types/finance";

const DEFAULT_FALLBACK_CATEGORY: Category =
  DEFAULT_CATEGORIES.find((category) => category.id === "outros") ?? {
    id: "outros",
    label: "Outros",
    icon: "outros",
    color: "#E8986D",
    custom: false,
  };

const sanitizeCategory = (unsafeValue: unknown): Category | null => {
  if (!unsafeValue || typeof unsafeValue !== "object") return null;

  const category = unsafeValue as Partial<Category>;
  const id = String(category.id ?? "").trim();
  const label = String(category.label ?? "").trim();

  if (!id || !label) return null;

  return {
    ...DEFAULT_FALLBACK_CATEGORY,
    ...category,
    id,
    label,
    icon:
      typeof category.icon === "string" && category.icon.trim()
        ? category.icon
        : DEFAULT_FALLBACK_CATEGORY.icon,
    color:
      typeof category.color === "string" && category.color.trim()
        ? category.color
        : DEFAULT_FALLBACK_CATEGORY.color,
    custom: Boolean(category.custom),
  };
};

const sanitizeCategories = (unsafeValue: unknown): Category[] => {
  if (!Array.isArray(unsafeValue)) return DEFAULT_CATEGORIES;

  const normalized = unsafeValue.reduce<Category[]>((acc, entry) => {
    const sanitized = sanitizeCategory(entry);
    if (sanitized) acc.push(sanitized);
    return acc;
  }, []);

  return normalized.length > 0 ? normalized : DEFAULT_CATEGORIES;
};

export const categoryService = {
  getAll: (): Category[] => sanitizeCategories(loadCat()),

  saveAll: (categories: Category[]) => {
    localStorage.setItem(LS_CAT, JSON.stringify(sanitizeCategories(categories)));
  },

  addCategory: (category: Category): Category => {
    const categories = categoryService.getAll();
    categories.push(category);
    categoryService.saveAll(categories);
    return category;
  },

  deleteCategory: (id: Category["id"]) => {
    const categories = categoryService
      .getAll()
      .filter((category) => category.id !== id);

    categoryService.saveAll(categories);
  },
};
