var socket;

var tela;
var largura = 640;
var altura = 480;

var jogador;
var jogadores = [];
var comidas = [];
//var comidas = [];
//var numComidas = 100;

var segurarMouse = false;

function setup(){
    //socket = io.connect("localhost:3000");
    socket = io.connect("192.168.0.8:3000");
    tela = createCanvas(largura, altura);
    frameRate(30);
    jogador = new Jogador();

    //Enviados
    socket.emit("novoJogador", jogador);

    //Recebidos
    socket.on("atualizarJogadores", atualizarJogadores);
    socket.on("atualizarComidas", atualizarComidas);
}

function draw(){
    if(jogador.id == "" || jogador.id == undefined){jogador.id = socket.id;}
    background(0);
    if(mouseIsPressed || segurarMouse){seguirDedo();}
    else{jogador.mover();}

    for(var i=0; i<comidas.length; i++){
        hit = collideCircleCircle(jogador.x, jogador.y, jogador.raio, comidas[i].x, comidas[i].y, comidas[i].raio);
        if(hit && jogador.raio > comidas[i].raio){
            comidas[i].comer();
            comidas.splice(i, 1);
        }
        else{comidas[i].desenhar();}
    }
    for(var i=0; i<jogadores.length; i++){
        if(jogadores[i].id != jogador.id){
            jogadores[i].desenhar();
        }
    }
    
    jogador.desenhar();
    fill(255, 0, 0);
    text(jogador.raio, jogador.x, jogador.y);
    if(frameCount % 60 == 0 && jogador.raio > 6){
        jogador.raio -= jogador.raio*0.008;
        socket.emit("atualizarPosicao", jogador);
    }
}

function keyPressed(){
    //jogador.botaoPressionado(keyCode);
}

function keyReleased(){
    //jogador.botaoSolto(keyCode);
}

function mousePressed(){
    if(segurarMouse){
        segurarMouse = false;
    }
    else{
        segurarMouse = true;
    }
}

function seguirDedo(){
    jogador.alvo = [mouseX, mouseY];
    jogador.seguirDedo();
    socket.emit("atualizarPosicao", jogador);
}

function atualizarJogadores(lista){
    jogadores = [];
    for(var i=0; i<lista.length; i++){
        jogadores.push(new Adversario(lista[i].x, lista[i].y, lista[i].raio, lista[i].score, lista[i].id));
    }
    if(lista.length == 0){
        jogadores = [];
    }
}

function atualizarComidas(lista){
    for(var i=0; i<lista.length; i++){
        comidas[i] = new Comida(lista[i].x, lista[i].y, lista[i].raio, lista[i].id);
    }
    if(lista.length == 0){
        comidas = [];
    }
}