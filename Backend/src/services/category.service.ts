import Category from "../models/category.model.js";

export async function getCategoriesService() {
    try {
        return await Category.findAll();
    } catch (err) {
        throw new Error("Failed to retrieve categories");
    }
}

export async function getCategoryByIdService(id: string) {
    try {
        return await Category.findByPk(id);
    } catch (err) {
        throw new Error("Failed to retrieve category");
    }
}
