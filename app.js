const express = require("express");
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser")
const app = express();
const usuario = require('./routes/usuario');
const path = require('path');
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const bcrypt = require('bcryptjs');
const passport = require('passport');
require("./config/auth")(passport)



require("./models/Usuario")
const Usuario = mongoose.model("usuarios");


require("./models/Tarefa");
const Tarefa = mongoose.model("tarefas")

//Configurações

//(Ordem importa)

// Sessão
app.use(session({
    secret: "logintarefa",
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

//Middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null;
    next();
})


//BodyParser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Handlebars
app.engine("handlebars", handlebars.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.use("/images", express.static(path.join(__dirname, "/public/img")));
app.set('/css', express.static(path.join(__dirname + "/public/css")));

//Public Bootstrap
app.use(express.static(path.join(__dirname, "public"))) //A pasta que está guardando todos nossos arquivos staticos é a Public

app.use((req, res, next) => {
    console.log("Midleware")
    next()

})

//mongoose
mongoose.connect('mongodb://localhost/logintarefas')
    .then(() => console.log('Connected!'));


//Rotas

app.get("/home", (req, res) => {
    res.render("index")
})


app.use("/usuarios", usuario);

app.get("/registro", (req, res) => {
    res.render("usuario/registro")
})



app.post("/registrob", (req, res) => {
    var erros = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome invalido" })
    }

    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({ texto: "Senha invalido" })
    }

    if (req.body.senha.length < 4) {
        erros.push({ texto: "Senha muito curta." })
    }

    if (req.body.senha != req.body.senha2) {
        erros.push({ texto: "As senhas são diferentes. Tente novamente" })
    }

    if (erros.length > 0) {
        res.render("usuarios/registro", { erros: erros })
    } else {
        Usuario.findOne({ nome: req.body.nome }).then((usuario) => {
            if (usuario) {
                req.flash("error_msg", "Já existe um usuario com este email no nosso sistema")
                res.redirect("/usuarios/registro")
            } else {
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    senha: req.body.senha
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if (erro) {
                            req.flash("error_msg", "Houve um erro durante o salvamento do usuario")
                            res.redirect("/")
                        }
                        novoUsuario.senha = hash

                        novoUsuario.save().then(() => {
                            req.flash("success_msg", "Usuario criado com sucesso!")
                            res.redirect("/home")
                        }).catch((err) => {
                            req.flash("error_msg", "Houve um erro interno")
                            res.redirect("/usuarios/registro")
                        })

                    })
                })


            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })

    }

})



app.get("/login", (req, res) => {
    res.render("usuario/login")
})


app.post("/loginb", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/home",
        failureRedirect: "/login",
        failureFlash: true
    })(req, res, next)
})


app.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err) }
        res.redirect('/home')
    })
})

//Outros
const PORT = 8081;
app.listen(PORT, () => {
    console.log("Servidor Rodando!")
});