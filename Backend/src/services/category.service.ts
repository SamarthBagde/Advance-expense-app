import Category from "../models/category.model.js";
import type { ICategoryResponseDTO } from "../types/category.type.js";

export async function getCategoriesService(): Promise<ICategoryResponseDTO[]> {
    try {
        const categories: ICategoryResponseDTO[] = await Category.findAll({
            attributes: ["id", "title"],
        });
        return categories;
    } catch (err) {
        throw new Error("Failed to retrieve categories");
    }
}

export async function getCategoryByIdService(id: string): Promise<ICategoryResponseDTO | null> {
    try {
        const category: ICategoryResponseDTO | null = await Category.findByPk(id, {
            attributes: ["id", "title"],
        });
        return category;
    } catch (err) {
        throw new Error("Failed to retrieve category");
    }
}
