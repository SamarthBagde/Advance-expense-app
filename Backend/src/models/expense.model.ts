import {
    DataTypes,
    type InferAttributes,
    type InferCreationAttributes,
    type CreationOptional,
    Model,
} from "sequelize";

import sequelize from "../config/database.js";
import Category from "./category.model.js";
import type { NonAttribute } from "sequelize";

class Expense extends Model<
    InferAttributes<Expense>,
    InferCreationAttributes<Expense>
> {
    declare id: CreationOptional<number>;

    declare userId: number;

    declare categoryId: number;

    declare title: string;

    declare amount: number;

    declare type: "CREDITED" | "DEBITED";

    declare expenseDate: CreationOptional<Date>;

    declare paymentMethod:
        | "CASH"
        | "UPI"
        | "DEBIT_CARD"
        | "CREDIT_CARD"
        | "BANK_TRANSFER"
        | "WALLET"
        | "OTHER";

    declare note: CreationOptional<string | null>;

    declare category?: NonAttribute<Category>;

    declare readonly createdAt: CreationOptional<Date>;

    declare readonly updatedAt: CreationOptional<Date>;
}

Expense.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        title: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },

        type: {
            type: DataTypes.ENUM("CREDITED", "DEBITED"),
            allowNull: false,
            defaultValue: "DEBITED",
        },

        expenseDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },

        paymentMethod: {
            type: DataTypes.ENUM(
                "CASH",
                "UPI",
                "DEBIT_CARD",
                "CREDIT_CARD",
                "BANK_TRANSFER",
                "WALLET",
                "OTHER"
            ),
            allowNull: false,
        },

        note: {
            type: DataTypes.TEXT,
            allowNull: true,
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
        tableName: "expenses",
        timestamps: true,
    }
);

Expense.belongsTo(Category, { foreignKey: "categoryId", as: "category" });
Category.hasMany(Expense, { foreignKey: "categoryId", as: "expenses" });

export default Expense;