const { response } = require( 'express' );
const bcrypt = require('bcrypt')
const Usuario = require('../models/usuario');

const getUsuarios = async (req, res) => {

    const usuarios = await Usuario.find({}, 'nombre email google role' );

    res.json({
        ok: true,
        usuarios
    });

}

const crearUsuarios = async (req, res = response) => {

    const { email, password } = req.body;
    try {

        const existeEmail = await Usuario.findOne({ email });

        if( existeEmail ) {
            return res.status(400).json({
                ok: false,
                msg: 'El correo ya existe',
            });
        }

        const usuario = new Usuario ( req.body );
        
        //Encriptar contraseña
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync( password, salt );
        
        // Guardar usuario
        await usuario.save();

        res.json({
            ok: true,
            usuario
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg: 'Error inesperado... revisar logs'
        });
    }

}

const actualizarUsuario = async ( req, res = response ) => {

    //TODO: Validar token y comprobar si el usuario es correcto

    const uid = req.params.id;

    try {

        const usuarioDB = await Usuario.findById( uid );

        if( !usuarioDB ){
            return res.status(404).json({
                ok: false,
                msg: 'No existe un usuario con ese ID'
            })
        }

        //Actualizaciones 
        const campos = req.body;

        if( usuarioDB.email === req.body.email ){
            delete campos.email;
        }else {
            const existeEmail = await Usuario.findOne({ email: req.body.email });
            if( existeEmail ){
                return res.status(400).json({
                    ok: false,
                    msg: 'Ya existe un usuario con ese email'
                })
            }
        }

        delete campos.password;
        delete campos.google;

        const usuarioActualizado = await Usuario.findByIdAndUpdate( uid, campos, { new:true } );


        res.json({
            ok:true,
            usuario: usuarioActualizado
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg: 'Error inesperado'
        });
    }
}

module.exports = {
    getUsuarios,
    crearUsuarios,
    actualizarUsuario
}