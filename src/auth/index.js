const jwt = require('jsonwebtoken');
const config = require('../config');
const error = require('../middleware/errors');

const secret = config.jwt.secret;

function asignarToken(data){
    return jwt.sign(data, secret);
    // return jwt.sign(data, secret, { expiresIn: '1h' });
}

function verificarToken(token){
    return jwt.verify(token, secret);
}

const chequearToken = {
    confirmarToken: function(req){
        const decodificado = decodificarCabecera(req);

        // if(decodificado.rol_id !== 1){
        //     throw error("No autorizado", 401);
        // }
    }
}

function obtenerToken(autorizacion){
    if(!autorizacion){
        throw error("No se proporcionó token de autorización", 401);
    }
    if(autorizacion.indexOf('Bearer ') === -1){
        throw error("Formato de token inválido", 401);
    }
    
    let token = autorizacion.replace('Bearer ', '');
    return token;
}

function decodificarCabecera(req){
    const autorizacion = req.headers.authorization || '';
    const token = obtenerToken(autorizacion);
    const decodificado = verificarToken(token);

    req.user = decodificado;
    return decodificado;
}

module.exports = {
    asignarToken,
    chequearToken
}