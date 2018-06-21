var socket;

var tela;
var largura = 200;
var altura = 200;

var escala;

var jogador;
var jogadores = [];
var comidas = [];

var baixoFPS = false;

var segurarMouse = true;

pegarNick();

function setup(){
    //socket = io.connect("localhost:3000");
    socket = io.connect("192.168.0.8:3000");

    socket.on("tamanhoMapa", function(dados){
        if(windowWidth < windowHeight){
            tela = createCanvas(windowWidth, windowWidth);
            escala = windowWidth/dados.l;
        }
        else{
            tela = createCanvas(windowHeight, windowHeight);
            escala = windowHeight/dados.a;
        }
        largura = dados.l;
        altura = dados.a;
        jogador.reset();
    });

    frameRate(30);
    jogador = new Jogador();

    //Enviados
    socket.emit("novoJogador", jogador);

    //Recebidos
    socket.on("atualizarJogadores", atualizarJogadores);
    socket.on("atualizarComidas", atualizarComidas);
    socket.on("tamanhoMapa", function(dados){
        if(windowWidth < windowHeight){
            tela = createCanvas(windowWidth, windowWidth);
            escala = windowWidth/dados.l;
        }
        else{
            tela = createCanvas(windowHeight, windowHeight);
            escala = windowHeight/dados.a;
        }
        largura = dados.l;
        altura = dados.a;
    });
}

function draw(){
    if(frameRate() < 22 && frameCount > 30){baixaTaxa();}
    else{baixoFPS = false;}
    scale(escala, escala);
    if(jogador.id == "" || jogador.id == undefined){jogador.id = socket.id;}
    background(255);
    grade();
    if(mouseIsPressed || segurarMouse){seguirDedo();}
    else{jogador.mover();}

    for(var i=0; i<comidas.length; i++){
        hit = collideCircleCircle(jogador.x, jogador.y, jogador.raio, comidas[i].x, comidas[i].y, comidas[i].raio);
        if(hit && jogador.raio > comidas[i].raio && !baixoFPS){
            comidas[i].comer();
            comidas.splice(i, 1);
        }
        else{comidas[i].desenhar();}
    }
    for(var i=0; i<jogadores.length; i++){
        if(jogadores[i].id != jogador.id){
            jogadores[i].desenhar();
            fill(jogadores[i].cor);
            textSize(20);
            text(jogadores[i].nick, jogadores[i].x-jogadores[i].raio/2, jogadores[i].y-jogadores[i].raio/2);
        }
    }
    
    jogador.desenhar();
    textos();
    if(frameCount % 60 == 0 && jogador.raio > 6){
        jogador.raio -= jogador.raio*0.008;
        socket.emit("atualizarPosicao", jogador);
    }
    //ranking();
}

function windowResized(){
    if(windowWidth < windowHeight){
        tela = createCanvas(windowWidth, windowWidth);
        escala = windowWidth/largura;
    }
    else{
        tela = createCanvas(windowHeight, windowHeight);
        escala = windowHeight/altura;
    }
}

function seguirDedo(){
    if(!baixoFPS){
        jogador.alvo = [mouseX/escala, mouseY/escala];
        jogador.seguirDedo(mouseX/escala, mouseY/escala);
        socket.emit("atualizarPosicao", jogador);
    }
    else{
        textSize(40);
        fill(255, 0, 0);
        text("FPS BAIXO!", largura/2, altura/2);
    }
}

function atualizarJogadores(lista){
    jogadores = [];
    for(var i=0; i<lista.length; i++){
        jogadores.push(new Adversario(lista[i].x, lista[i].y, lista[i].raio, lista[i].score, lista[i].id, lista[i].nick));
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

function textos(){
    //Raio
    fill(180, 180, 0);
    textSize(14);
    text(jogador.raio.toFixed(1), jogador.x, jogador.y);
    fill(jogador.cor);
    textSize(20);
    text(jogador.nick, jogador.x-jogador.raio/2, jogador.y-jogador.raio/2);
    //Nome
}

function grade(){
    espacamento = 25;
    y = largura/espacamento;
    x = altura/espacamento;
    strokeWeight(1);
    stroke(200);
    for(var i=0; i<x; i++){
        line(0, i*espacamento, largura, i*espacamento);
    }
    for(var i=0; i<y; i++){
        line(i*espacamento, 0, i*espacamento, altura);
    }
}

function baixaTaxa(){
    baixoFPS = true;
}

function pegarNick(){
    document.write("<input id='nick' type='text' autofocus><button id='botao' onclick=concluirNick()>Pronto!</button><br>");
}

function concluirNick(){
    document.getElementById("nick").style.visibility = "hidden";
    document.getElementById("botao").style.visibility = "hidden";
    window.scrollTo(0, document.body.scrollHeight);
    document.body.style.overflow = "hidden";
    jogador.nick = document.getElementById("nick").value;
}

function ranking(){
    p1 = {texto:"", raio:0};
    p2 = {texto:"", raio:0};
    p3 = {texto:"", raio:0};
    for(var i=0; i<jogadores.length; i++){
        if(jogadores[i].raio > p1.raio){
            p3 = p2;
            p2 = p1;
            p1.texto = jogadores[i].nick + " - " + jogadores[i].raio.toFixed(1);
            p1.raio = jogadores[i].raio;
        }
        else if(jogadores[i].raio > p2.raio){
            p3 = p2;
            p2.texto = jogadores[i].nick + " - " + jogadores[i].raio.toFixed(1);
            p2.raio = jogadores[i].raio;
        }
        else if(jogadores[i].raio > p3.raio){
            p3.texto = jogadores[i].nick + " - " + jogadores[i].raio.toFixed(1);
            p3.raio = jogadores[i].raio;
        }
    }
    fill(100);
    textSize(14);
    text(p1.texto, 5, 15);
    text(p2.texto, 5, 30);
    text(p3.texto, 5, 45);
}