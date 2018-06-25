//Requisitos
var express = require("express");
var app = express();
var servidor = app.listen(3000);
app.use(express.static("public"));
var socket = require("socket.io");
var io = socket(servidor);

//Rodando
console.log("\n\n\n==========");
console.log("Servidor Rodando...");
console.log("==========\n\n\n");

//VARIAVEIS
var largura = 500;
var altura = largura;
var jogadores = [];
var comidas = [];
var numComidas = largura*altura/2000;

for(var i=0; i<numComidas; i++){
    comidas.push(new Comida());
}

//ATUALIZAR SERVIDOR
setInterval(atualizarServidor, 25);
function atualizarServidor(){
    io.sockets.emit("atualizarJogadores", jogadores);
    io.sockets.emit("atualizarComidas", comidas);
}

setInterval(novasComidas, 1000);
function novasComidas(){
    if(comidas.length < numComidas){
        comidas.push(new Comida());
    }
}

//CONEXOES
io.sockets.on("connection", novaConexao);
function novaConexao(socket){
    
    console.log("Nova Conexao...");
    socket.emit("tamanhoMapa", dados={l:largura, a:altura});

    //RECEBIDOS
    socket.on("novoJogador", novoJogador);
    function novoJogador(jogador){
        jogadores.push(new Jogador(jogador.x, jogador.y, jogador.raio, jogador.score, socket.id, jogador.nick, jogador.emJogo));
        console.log("Jogadores Online: " + jogadores.length + "\n");
    }

    socket.on("comeu", comeu);
    function comeu(id){
        for(var i=0; i<comidas.length; i++){
            if(comidas[i].id == id){
                comidas.splice(i, 1);
                break;
            }
        }
    }

    socket.on("engolir", engolir);
    function engolir(id){
        for(var i=0; i<jogadores.length; i++){
            if(id == jogadores[i].id){
                //socket.emit("perdeu", id);
                jogadores.splice(i, 1);
                break;
            }
        }
    }

    socket.on("atualizarPosicao", atualizarPosicao);
    function atualizarPosicao(jogador){
        for(var i=0; i<jogadores.length; i++){
            if(jogadores[i].id == jogador.id){
                jogadores[i] = new Jogador(jogador.x, jogador.y, jogador.raio, jogador.score, jogador.id, jogador.nick, jogador.emJogo);
                break;
            }
        }
    }

    //DESCONEXAO
    socket.on("disconnect", desconectar);
    function desconectar(){
        for(var i=0; i<jogadores.length; i++){
            if(jogadores[i].id == socket.id){
                jogadores.splice(i, 1);
                console.log("\nJogador Desconectou...");
                console.log("Jogadores Online: " + jogadores.length + "\n");
                break;
            }
        }
    }

}

//CLASSES
function Jogador(x, y, raio, score, id, nick, emJogo){
    //Atributos
    this.x = x;
    this.y = y;
    this.raio = raio;
    this.score = score;
    this.id = id;
    this.nick = nick;
    this.emJogo = emJogo;
}

function Comida(){
    //Atributos
    this.raio = Math.floor((Math.random() * 5) + 2);
    this.x = Math.floor((Math.random() * (largura-this.raio/2)) + this.raio/2);
    this.y = Math.floor((Math.random() * (altura-this.raio/2)) + this.raio/2);
    this.id = "C" + this.x + "" + this.y + "" + this.raio;
}