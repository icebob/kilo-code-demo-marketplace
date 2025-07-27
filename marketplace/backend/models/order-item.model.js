"use strict";

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const OrderItem = sequelize.define("OrderItem", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "orders",
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
        seller_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "id"
            }
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1
            }
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0
            }
        }
    }, {
        tableName: "order_items",
        indexes: [
            {
                fields: ["order_id"]
            },
            {
                fields: ["seller_id"]
            }
        ]
    });

    OrderItem.associate = (models) => {
        OrderItem.belongsTo(models.Order, {
            foreignKey: "order_id",
            as: "order"
        });
        OrderItem.belongsTo(models.Product, {
            foreignKey: "product_id",
            as: "product"
        });
        OrderItem.belongsTo(models.User, {
            foreignKey: "seller_id",
            as: "seller"
        });
    };

    return OrderItem;
};