"use strict";

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const CartItem = sequelize.define("CartItem", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "id"
            }
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "products",
                key: "id"
            }
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                min: 1
            }
        }
    }, {
        tableName: "cart_items",
        indexes: [
            {
                unique: true,
                fields: ["user_id", "product_id"]
            }
        ]
    });

    CartItem.associate = (models) => {
        CartItem.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "user"
        });
        CartItem.belongsTo(models.Product, {
            foreignKey: "product_id",
            as: "product"
        });
    };

    return CartItem;
};