"use strict";

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Product = sequelize.define("Product", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        seller_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "id"
            }
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [3, 200]
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0.01
            }
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                min: 0
            }
        },
        image_url: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isUrl: true
            }
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: "active",
            allowNull: false,
            validate: {
                isIn: [["active", "inactive", "sold_out"]]
            }
        }
    }, {
        tableName: "products",
        indexes: [
            {
                fields: ["seller_id"]
            },
            {
                fields: ["status"]
            }
        ]
    });

    Product.associate = (models) => {
        Product.belongsTo(models.User, {
            foreignKey: "seller_id",
            as: "seller"
        });
    };

    return Product;
};