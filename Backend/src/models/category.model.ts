import {
    DataTypes,
    type InferAttributes,
    type InferCreationAttributes,
    type CreationOptional,
    Model,
} from "sequelize";

import sequelize from "../config/database.js";

class Category extends Model<
    InferAttributes<Category>,
    InferCreationAttributes<Category>
> {
    declare id: CreationOptional<number>;

    declare title: string;

    declare readonly createdAt: CreationOptional<Date>;

    declare readonly updatedAt: CreationOptional<Date>;
}

Category.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        title: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },

        createdAt: {
            type: DataTypes.DATE
        },

        updatedAt: {
            type: DataTypes.DATE
        }
    },
    {
        sequelize,
        tableName: "categories",
        timestamps: true,
    }
);

export default Category;