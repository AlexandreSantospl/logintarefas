const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')


require("../models/Usuario")
const Usuario = mongoose.model("usuarios")

module.exports = function (passport) {
    passport.use(new localStrategy({ usernameField: 'nome', passwordField: 'senha' }, (nome, senha, done) => {

        Usuario.findOne({ nome: nome }).then((Usuario) => {
            if (!Usuario) {
                return done(null, false, { message: "Está conta não existe" })
            }

            bcrypt.compare(senha, Usuario.senha, (erro, batem) => {

                if (batem) {
                    return done(null, Usuario)
                } else {
                    return done(null, false, { message: "Senha incorreta!" })
                }

            })
        })

    }))





    passport.serializeUser((usuario, done) => {
        done(null, usuario._id)
    })

    passport.deserializeUser((id, done) => {
        Usuario.findById(id).lean().then((usuario) => {
            done(null, usuario)
        }).catch((err) => {
            done(null, false, { message: 'algo deu errado' })
        })
    })

}