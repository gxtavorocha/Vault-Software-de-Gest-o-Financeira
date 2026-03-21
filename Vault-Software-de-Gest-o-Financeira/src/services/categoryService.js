import { LS_CAT, loadCat } from "../constants";

export const categoryService = {
  getAll: () => {
    return loadCat();
  },

  saveAll: (categories) => {
    localStorage.setItem(LS_CAT, JSON.stringify(categories));
  },

  addCategory: (category) => {
    const categories = categoryService.getAll();
    categories.push(category);
    categoryService.saveAll(categories);
    return category;
  },

  deleteCategory: (id) => {
    let categories = categoryService.getAll();
    categories = categories.filter((c) => c.id !== id);
    categoryService.saveAll(categories);
  }
};
