"use strict";

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Order = sequelize.define("Order", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        buyer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "id"
            }
        },
        total_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0
            }
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: "pending",
            allowNull: false,
            validate: {
                isIn: [["pending", "processing", "completed", "cancelled"]]
            }
        },
        shipping_address: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        tableName: "orders",
        indexes: [
            {
                fields: ["buyer_id"]
            },
            {
                fields: ["status"]
            }
        ]
    });

    Order.associate = (models) => {
        Order.belongsTo(models.User, {
            foreignKey: "buyer_id",
            as: "buyer"
        });
        Order.hasMany(models.OrderItem, {
            foreignKey: "order_id",
            as: "items"
        });
    };

    return Order;
};