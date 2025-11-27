require('dotenv').config();

module.exports = {
    app: {
        port: process.env.PORT || 4000,
    },
    jwt:{
        secret: process.env.JWT_SECRET || 'defaultsecret'
    },
    mysql: {
        host: process.env.MYSQL_HOST || 'localhost',
        port: parseInt(process.env.MYSQL_PORT, 10) || 3306,
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'test',
    }
}

