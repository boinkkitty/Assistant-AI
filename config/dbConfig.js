module.exports = {
    host: 'localhost',
    user: 'daryl',
    password: '',
    db: 'assistantai2',
    dialect: 'postgresql',

    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}
