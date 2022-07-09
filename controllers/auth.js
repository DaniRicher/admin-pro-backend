const { response } = require("express");
const bcrypt = require('bcrypt');
const Usuario = require("../models/usuario");
const { generarJWT } = require("../helpers/jwt");


const login = async(req, res = response) => {

    const { email, password } = req.body;

    try {

        //Verificar email
        const usuarioDB = await Usuario.findOne({ email });
        if( !usuarioDB ) {
            return res.status(400).json({
                ok: false,
                msg: 'email no valido'
            });
        }

        //Verifcar Contraseña
        const validPassword = bcrypt.compareSync( password, usuarioDB.password );

        if( !validPassword ) {
            return res.status(400).json({
                ok: false,
                msg: 'La contraseña no es valida'
            });
        }

        //Generar JWT
        const token = await  generarJWT( usuarioDB.id );

        res.status(200).json({
            ok: true,
            token
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }

}

module.exports = {
    login,
}