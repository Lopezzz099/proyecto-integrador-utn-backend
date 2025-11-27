function error(mensaje, codigo){
    let e = new Error(mensaje);
    if(codigo){
        e.statusCode = codigo;
    }
    return e;
}

module.exports = error