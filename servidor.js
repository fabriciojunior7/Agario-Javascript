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
var buracos = [];
var numComidas = Math.floor(largura*altura/2000);
var numBuracos = Math.floor(largura*0.006);

for(var i=0; i<numComidas; i++){
    comidas.push(new Comida());
}

for(var i=0; i<numBuracos; i++){
    buracos.push(new Buraco());
}

//ATUALIZAR SERVIDOR
setInterval(atualizarServidor, 25);
function atualizarServidor(){
    io.sockets.emit("atualizarJogadores", jogadores);
    io.sockets.emit("atualizarComidas", comidas);
    io.sockets.emit("atualizarBuracos", buracos);
}

setInterval(novasComidas, 250);
function novasComidas(){
    if(comidas.length < numComidas){
        comidas.push(new Comida());
    }
}

setInterval(atualizarBuracos, 250);
function atualizarBuracos(){
    if(buracos.length < numBuracos){
        buracos.push(new Buraco());
    }
    for(var i=0; i<buracos.length; i++){
        buracos[i].vibrar();
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

function Buraco(){
    //Atributos
    var r = Math.floor((Math.random() * 5) + 4)/100;
    this.raio = largura*r;
    this.x = Math.floor((Math.random() * (largura-this.raio/2)) + this.raio/2);
    this.y = Math.floor((Math.random() * (altura-this.raio/2)) + this.raio/2);
    this.tempoDeVida = Math.floor((Math.random() * 1001) + 100);

    //Metodos
    this.vibrar = function(){
        this.x += Math.floor((Math.random() * 5) - 2);
        this.y += Math.floor((Math.random() * 5) - 2);
        if(this.x < this.raio){this.x = this.raio/2;}
        else if(this.x > largura-this.raio){this.x = largura-this.raio/2;}
        if(this.y < this.raio){this.y = this.raio/2;}
        else if(this.y > altura-this.raio){this.y = altura-this.raio/2;}
    }
}