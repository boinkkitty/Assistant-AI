// To be included later in gitignore

require('dotenv').config(); // load .env

module.exports = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    db: process.env.DB_NAME,
    dialect: process.env.DB_DIALECT,

    pool: {
        max: parseInt(process.env.DB_POOL_MAX) || 10,
        min: parseInt(process.env.DB_POOL_MIN) || 0,
        acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
        idle: parseInt(process.env.DB_POOL_IDLE) || 10000
    }
};

/*

module.exports = {
    host: 'localhost',
    user: 'root',
    password: 'Test1234',
    db: 'AssistantAI',
    dialect: 'postgres',

    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}

*/