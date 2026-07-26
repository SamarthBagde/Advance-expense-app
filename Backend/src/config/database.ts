import { Sequelize } from "sequelize";
import { getEnvVariable } from "../utils/env.js"


const sequelize = new Sequelize(
    getEnvVariable("DB_NAME"),
    getEnvVariable("DB_USER"),
    getEnvVariable("DB_PASSWORD"),
    {
        host: getEnvVariable("DB_HOST"),
        dialect: "postgres",
        logging: false,
    }
);
export default sequelize;