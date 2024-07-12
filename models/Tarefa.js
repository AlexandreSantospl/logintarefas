const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Tarefa = new Schema({
    nome: {
        type: String,
        required: true
    },
    descricao: {
        type: String
    },
    data: {
        type: Date,
        default: Date.now()
    },
    completo: {
        type: Boolean,
        default: false
    },
    dono: {
        type: String,
        required: true
    }
})

mongoose.model("tarefas", Tarefa);
