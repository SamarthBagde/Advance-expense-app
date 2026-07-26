import "dotenv/config";
import sequelize from "../config/database.js";
import Category from "../models/category.model.js";

const categories = [
    { title: "Food & Dining" },
    { title: "Groceries" },
    { title: "Transportation" },
    { title: "Shopping" },
    { title: "Entertainment" },
    { title: "Bills & Utilities" },
    { title: "Healthcare" },
    { title: "Education" },
    { title: "Travel" },
    { title: "Personal Care" },
    { title: "Rent" },
    { title: "Insurance" },
    { title: "Taxes" },
    { title: "Gifts & Donations" },
    { title: "Subscriptions" },
    { title: "Investments" },
    { title: "Other" },
];

const seedCategories = async () => {
    try {
        await sequelize.authenticate();

        await Category.sync();

        const count = await Category.count();

        if (count > 0) {
            console.log("Categories already exist.");
            process.exit(0);
        }

        await Category.bulkCreate(categories);

        console.log("Categories seeded successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding categories:", error);
        process.exit(1);
    }
};

seedCategories();