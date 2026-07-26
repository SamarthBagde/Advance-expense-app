import "dotenv/config";
import app from "./app.js";
import sequelize from "./config/database.js";

const PORT = process.env.PORT || 3000;

import "./models/user.model.js";
import "./models/category.model.js";
import "./models/expense.model.js";

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected successfully");
        //  create/alter tables based on the models
        await sequelize.sync({ alter: true });

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Database connection failed", error);
    }
};

startServer();