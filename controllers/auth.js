const { response } = require("express");
const { googleVerify } = require("../helpers/google-verify");
const { generarJWT } = require("../helpers/jwt");
const bcrypt = require('bcrypt');
const Usuario = require("../models/usuario");
const { getMenuFrontEnd } = require("../helpers/menu-frontend");


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
            token,
            menu: getMenuFrontEnd( usuarioDB.role )
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }

}

const googleSignIn = async(req, res = response) => {

    try {

        const { email, name, picture } = await googleVerify( req.body.token );

        const usuarioDB = await Usuario.findOne({ email });
        let usuario;

        if( !usuarioDB ) {
            usuario = new Usuario({
                nombre: name,
                email,
                password: '@@@',
                img: picture,
                google: true
            })
        } else {
            usuario = usuarioDB;
            usuario.google = true;
        }

        //Guardar Usuario
        await usuario.save();

        //Generar TOKEN - JWT
        const token = await  generarJWT( usuarioDB.id );

        res.json({
            ok: true,
            email, name, picture,
            token,
            menu: getMenuFrontEnd( usuarioDB.role )
        });
        
    } catch (error) {

        console.log(error);
        res.status(400).json({
            ok: false,
            msg: 'Token de google no es correcto'
        });
    }

}

const renewToken = async ( req, res = response) => {

    const uid = req.uid;

    //Obtener usuario
    const usuarioDB = await Usuario.findById( uid );

    //Generar TOKEN - JWT
    const token = await  generarJWT( uid );
    res.json({
        ok: true,
        token,
        usuarioDB,
        menu: getMenuFrontEnd( usuarioDB.role )

    });
}

module.exports = {
    login,
    googleSignIn,
    renewToken
}