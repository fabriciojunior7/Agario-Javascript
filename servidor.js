//Requisitos
var express = require("express");
var app = express();
var servidor = app.listen(3000);
app.use(express.static("public"));
var socket = require("socket.io");
var io = socket(servidor);

//Rodando
console.log("\n\n\n====================");
console.log("Servidor Rodando...");
console.log("====================\n\n\n");

//VARIAVEIS
var largura = 500;
var altura = largura;
var jogadores = [];
var comidas = [];
var buracos = [];
var balas = [];
var numComidas = Math.floor(largura*altura/1500);
var comidasTotais = 0;
var balasTotais = 0;
var ultimaBala = false;
var numBuracos = Math.floor(largura*0.006);
var tempoInicial = 600;
var tempo = tempoInicial;
var contagemRegressivaInicial = 5;
var contagemRegressiva = contagemRegressivaInicial;
var partidarTotais = 0;
var conexoesTotais = 0;

for(var i=0; i<numComidas; i++){
    comidas.push(new Comida());
}
    
for(var i=0; i<numBuracos; i++){
    buracos.push(new Buraco());
}

//ATUALIZAR SERVIDOR
setInterval(atualizarServidor, 40);
function atualizarServidor(){
    //Jogadores
    io.sockets.emit("atualizarJogadores", jogadores);
    //Balas
    if(balas.length > 0){
        ultimaBala = true
        io.sockets.emit("atualizarBalas", balas);
    }
    else if(ultimaBala){
        ultimaBala = false;
        io.sockets.emit("atualizarBalas", balas);
    }
}

//CRONOMETRO
setInterval(cronometro, 1000);
function cronometro(){
    if(jogadores.length > 0){
        if(tempo > 0){
            tempo--;
        }
        else{
            //if(contagemRegressiva == 10){console.log("\n")}
            //console.log("Contagem Regressiva: "+contagemRegressiva+" s");
            contagemRegressiva--;
            if(contagemRegressiva < 0){
                tempo = tempoInicial;
                contagemRegressiva = contagemRegressivaInicial;
                jogadores = [];
                partidarTotais++;
                console.log("\nTotal de Partidas: "+partidarTotais+"\n");
            }
        }
        dados = {tempo:tempo, contagemRegressiva:contagemRegressiva};
        io.sockets.emit("cronometro", dados);
    }
    else if(tempo <= 5){tempo = tempoInicial;}
}

//BALAS
setInterval(moverBalas, 33);
function moverBalas(){
    for(var i=0; i<balas.length; i++){
        balas[i].mover();
        if(balas[i].x < 0 || balas[i].x > largura || balas[i].y < 0 || balas[i].y > altura){balas.splice(i, 1);}
    }
}

//VERIFICADOR DE COMIDAS
setInterval(novasComidas, 250);
function novasComidas(){
    if(comidas.length < numComidas){
        comidas.push(new Comida());
        io.sockets.emit("atualizarComidas", comidas);
    }
}

//BURACOS
setInterval(atualizarBuracos, 250);
function atualizarBuracos(){
    if(buracos.length < numBuracos){
        buracos.push(new Buraco());
    }
    for(var i=0; i<buracos.length; i++){
        buracos[i].mover();
    }
    io.sockets.emit("atualizarBuracos", buracos);
}

//CONEXOES
io.sockets.on("connection", novaConexao);
function novaConexao(socket){
    
    conexoesTotais++;
    data = new Date();
    dataDeAcesso = data.getHours()+":"+data.getMinutes()+":"+data.getSeconds()+" - "+data.getDate()+"/"+(data.getMonth()+1)+"/"+data.getFullYear();
    console.log("Nova Conexao... (Total: "+conexoesTotais+" - "+jogadores.length+") - ("+dataDeAcesso+")");
    socket.emit("tamanhoMapa", dados={l:largura, a:altura});
    socket.emit("atualizarComidas", comidas);

    //RECEBIDOS
    socket.on("novoJogador", novoJogador);
    function novoJogador(jogador){
        jogadores.push(new Jogador(jogador.x, jogador.y, jogador.raio, jogador.score, socket.id, jogador.nick, jogador.emJogo));
    }

    socket.on("comeu", comeu);
    function comeu(id){
        for(var i=0; i<comidas.length; i++){
            if(comidas[i].id == id){
                comidas.splice(i, 1);
                break;
            }
        }
        //socket.emit("atualizarComidas", comidas);
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

    socket.on("atirar", atirar);
    function atirar(jogador){
        x = Math.floor(jogador.x);
        y = Math.floor(jogador.y);
        id = jogador.id;
        for(var i=0; i<8; i++){
            balas.push(new Bala(x, y, i, id));
        }
    }

    socket.on("balaColidida", balaColidida);
    function balaColidida(id){
        for(var i=0; i<balas.length; i++){
            if(balas[i].id == id){
                balas.splice(i, 1);
                //console.log(i);
                //break;
            }
        }
    }

    socket.on("novoNick", novoNick);
    function novoNick(nick){
        data = new Date();
        dataDeAcesso = data.getHours()+":"+data.getMinutes()+":"+data.getSeconds()+" - "+data.getDate()+"/"+(data.getMonth()+1)+"/"+data.getFullYear();
        console.log("--- Novo Jogador: ("+nick+") - (Total: "+conexoesTotais+" - "+jogadores.length+") - ("+dataDeAcesso+")");
    }

    //DESCONEXAO
    socket.on("disconnect", desconectar);
    function desconectar(){
        for(var i=0; i<jogadores.length; i++){
            if(jogadores[i].id == socket.id){
                //conexoesTotais--;
                data = new Date();
                dataDeAcesso = data.getHours()+":"+data.getMinutes()+":"+data.getSeconds()+" - "+data.getDate()+"/"+(data.getMonth()+1)+"/"+data.getFullYear();
                console.log("--- Desconexao: ("+jogadores[i].nick+") - (Total: "+conexoesTotais+" - "+(jogadores.length-1)+") - ("+dataDeAcesso+")");
                jogadores.splice(i, 1);
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
    //this.id = "C" + this.x + "" + this.y + "" + this.raio + codigoComida();
    this.id = "C"+codigoComida();
}

function Buraco(){
    //Atributos
    var r = Math.floor((Math.random() * 5) + 4)/100;
    this.raio = largura*r;
    this.x = Math.floor((Math.random() * (largura-this.raio/2)) + this.raio/2);
    this.y = Math.floor((Math.random() * (altura-this.raio/2)) + this.raio/2);
    this.tempoDeVida = Math.floor((Math.random() * 1001) + 100);
    this.velocidadeX = Math.random() * 2 * Math.floor((Math.random() * 3) - 1);
    this.velocidadeY = Math.random() * 2 * Math.floor((Math.random() * 3) - 1);
    if(this.velocidadeX == 0){this.velocidadeX = 1;}
    if(this.velocidadeY == 0){this.velocidadeY = 1;}

    //Metodos
    this.vibrar = function(){
        this.x += Math.floor((Math.random() * 5) - 2);
        this.y += Math.floor((Math.random() * 5) - 2);
    }

    this.mover = function(){
        this.x += this.velocidadeX;
        this.y += this.velocidadeY;
        this.vibrar();
        if(this.x < this.raio/2){this.x = this.raio/2; this.velocidadeX*=(-1);}
        else if(this.x > largura-this.raio/2){this.x = largura-this.raio/2; this.velocidadeX*=(-1);}
        if(this.y < this.raio/2){this.y = this.raio/2; this.velocidadeY*=(-1);}
        else if(this.y > altura-this.raio/2){this.y = altura-this.raio/2; this.velocidadeY*=(-1);}
    }
}

function Bala(x, y, num, id){
    //Atributos
    this.x = x;
    this.y = y;
    this.num = num;
    this.id = id;
    this.codigo = "B"+codigoBala();
    this.velocidade = 8;
    this.velocidadeX = Math.sin((Math.PI/4)*num)*this.velocidade;
    this.velocidadeY = Math.cos((Math.PI/4)*num)*this.velocidade;
    this.raio = largura*0.02;
    
    //Metodos
    this.mover = function(){
        this.x += this.velocidadeX;
        this.y += this.velocidadeY;
    }
}

//Outros
function resetPartida(){
    jogador = [];
    balas = [];
    comidas = [];
    for(var i=0; i<numComidas; i++){
        comidas.push(new Comida());
    }
    
    for(var i=0; i<numBuracos; i++){
        buracos.push(new Buraco());
    }
}

function collideCircleCircle(x1, y1, r1, x2, y2, r2){
    distX = Math.abs(x1 - x2);
    distY = Math.abs(y1 - y2);
    raios = r1 + r2;
    if(distX < raios || distY < raios){
        return(true);
    }
    else{
        return(false);
    }
}

function codigoComida(){
    comidasTotais++;
    return comidasTotais;
}

function codigoBala(){
    balasTotais++;
    return balasTotais;
}