const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', process.env.DATABASE_URL || './marketplace.db'),
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

module.exports = sequelize;