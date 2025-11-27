const mysql = require('mysql');
const config = require('../config');

const dbconfig = {
    host: config.mysql.host,
    port: config.mysql.port,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
}

let conexion;
function conectarMysql(){
    conexion = mysql.createConnection(dbconfig);
    conexion.connect((err) => {
        if(err){
            console.log('[db err]', err);
            setTimeout(conectarMysql, 200);
        } else {
            console.log('DB conectada');
        }
    });
    conexion.on('error', err => {
        console.log('[db err]', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST'){
            conectarMysql();
        } else {
            throw err;
        }
    });
}

conectarMysql();

function consulta(sql, params = []) {
    return new Promise((resolve, reject) => {
        conexion.query(sql, params, (error, results) => {
            return error ? reject(error) : resolve(results);
        });
    });
}

function todos(tabla) {
    return new Promise((resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla}`, (error, results) => {
            return error ? reject(error) : resolve(results);
        });
    });
}

function uno(tabla, id){
    return new Promise((resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla} WHERE id = ?`, [id], (error, results) => {
            return error ? reject(error) : resolve(results);
        });
    });
}

function insertar(tabla, data){
    return new Promise((resolve, reject) => {
        const { id, ...cleanData } = data;
        conexion.query(`INSERT INTO ${tabla} SET ?`, cleanData, (error, results) => {
            return error ? reject(error) : resolve(results);
        });
    });
}

function actualizar(tabla, data){
    return new Promise((resolve, reject) => {
        conexion.query(`UPDATE ${tabla} SET ? WHERE id = ?`, [data, data.id], (error, results) => {
            return error ? reject(error) : resolve(results);
        });
    });
}

function eliminar(tabla, id){
    return new Promise((resolve, reject) => {
        conexion.query(`DELETE FROM ${tabla} WHERE id = ?`, [id], (error, results) => {
            return error ? reject(error) : resolve(results);
        });
    });
}

function login(tabla, email){
    return new Promise((resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla} WHERE email = ?`, [email], (error, results) => {
            return error ? reject(error) : resolve(results);
        });
    });
}

module.exports = {
    todos,
    uno,
    insertar,
    actualizar,
    eliminar,
    login,
    consulta
}