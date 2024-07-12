const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require("../models/Tarefa");
const Tarefa = mongoose.model("tarefas");




router.get("/nova", (req, res) => {
    res.render("tarefas/novatarefa")
})

router.post("/nova", (req, res) => {
    const novaTarefa = {
        nome: req.body.nome,
        descricao: req.body.descricao,
        dono: req.body.dono

    }
    new Tarefa(novaTarefa).save().then(() => {
        req.flash("success_msg", "Tarefa salva com sucesso!")
        res.redirect("/home")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao salvar a tarefa")
        res.redirect("/home")
    })
})


router.get("/tarefas", (req, res) => {
    Tarefa.find({ dono: req.user.nome }).lean().sort({ data: "desc" }).then((tarefas) => {
        res.render("exibicao/tarefas", { tarefas: tarefas })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao exibir as tarefas")
        res.redirect("/home")
    })

})

router.post("/finalizado", (req, res) => {
    Tarefa.findOne({ _id: req.body.id }).then((tarefas) => {
        tarefas.completo = true

        tarefas.save().then(() => {
            req.flash("success_msg", "Postagem editada com sucesso!")
            res.redirect("/usuarios/tarefas")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro editar")
            res.redirect("/usuarios/tarefas")
        })

    })
})

router.get("/concluidas", (req, res) => {
    Tarefa.find({ dono: req.user.nome }).lean().sort({ data: "desc" }).then((tarefas) => {
        res.render("exibicao/concluidas", { tarefas: tarefas })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao exibir as tarefas concluidas")
        res.redirect("/home")
    })
})


router.get("/deletar", (req, res) => {
    Tarefa.find({ dono: req.user.nome }).lean().sort({ data: "desc" }).then((tarefas) => {
        res.render("tarefas/deletartarefa", { tarefas: tarefas })
    })
})

router.post("/deletar/:id", (req, res) => {
    Tarefa.deleteOne({ _id: req.params.id }).lean().then(() => {
        req.flash("success_msg", "Tarefa Excluida com sucesso!")
        res.redirect("/usuarios/deletar")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar a tarefa")
        res.redirect("/home")
    })
})




module.exports = router