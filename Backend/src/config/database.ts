import { Sequelize } from "sequelize";
import { requireEnv } from "../utils/env.js"


const sequelize = new Sequelize(
    requireEnv("DB_NAME"),
    requireEnv("DB_USER"),
    requireEnv("DB_PASSWORD"),
    {
        host: process.env.DB_HOST ?? "localhost",
        dialect: "postgres",
        logging: false,
    }
);
export default sequelize;