import {
    DataTypes,
    type InferAttributes,
    type InferCreationAttributes,
    type CreationOptional,
    Model,
} from "sequelize";

import sequelize from "../config/database.js";

class User extends Model<
    InferAttributes<User>,
    InferCreationAttributes<User>
> {
    declare id: CreationOptional<number>;

    declare username: string;

    declare email: string;

    declare password: string;

    declare phone: CreationOptional<string | null>;

    declare readonly createdAt: CreationOptional<Date>;

    declare readonly updatedAt: CreationOptional<Date>;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },

        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },

        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        phone: {
            type: DataTypes.STRING(15),
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
        tableName: "users",
        timestamps: true,
    }
);

export default User;