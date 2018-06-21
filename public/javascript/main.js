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
        }
    }
    
    jogador.desenhar();
    textos();
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
    /*if(segurarMouse){
        segurarMouse = false;
    }
    else{
        segurarMouse = true;
    }*/
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

function textos(){
    //Raio
    fill(200, 200, 0);
    textSize(14);
    text(jogador.raio.toFixed(1), jogador.x, jogador.y);
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