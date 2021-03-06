var socket;

var tela;
var largura = 200;
var altura = 200;
var cookieUsado = false;

var escala;

var jogador;
var jogadores = [];
var comidas = [];
var buracos = [];
var balas = [];

var baixoFPS = false;
var estouVivo = false;
var segurarMouse = true;

var relogio = 0;

function setup(){
    //socket = io.connect("localhost:3000");
    //socket = io.connect("192.168.0.8:3000");
    socket = io.connect("http://fabriciojunior777.ddns.net:3000");

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
    socket.on("cronometro", cronometro);
    socket.on("atualizarJogadores", atualizarJogadores);
    socket.on("atualizarComidas", atualizarComidas);
    socket.on("atualizarBuracos", atualizarBuracos);
    socket.on("atualizarBalas", atualizarBalas);
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
    //if(frameRate() < 22 && frameCount > 30){baixaTaxa();}
    //else{baixoFPS = false;}
    if(!cookieUsado){
        usandoCookies();
        cookieUsado = true;
    }
    scale(escala, escala);
    textAlign(CENTER);
    if(jogador.id == "" || jogador.id == undefined){jogador.id = socket.id;}
    background(255);
    grade();

    if(estouVivo){
        if(mouseIsPressed || segurarMouse){seguirDedo();}
        else{jogador.mover();}
    }

    //Comidas
    for(var i=0; i<comidas.length; i++){
        hit = collideCircleCircle(jogador.x, jogador.y, jogador.raio, comidas[i].x, comidas[i].y, comidas[i].raio);
        if(estouVivo && hit && jogador.raio > comidas[i].raio && !baixoFPS && jogador.emJogo){
            comidas[i].comer();
            comidas.splice(i, 1);
        }
        else{comidas[i].desenhar();}
    }

    //BALAS
    for(var i=0; i<balas.length; i++){
        balas[i].desenhar();
        hit = collideCircleCircle(jogador.x, jogador.y, jogador.raio, balas[i].x, balas[i].y, balas[i].raio);
        if(hit && jogador.emJogo && balas[i].id != jogador.id){
            jogador.atingirBala(balas[i]);
            socket.emit("balaColidida", balas[i].id);
            balas.splice(i, 1);
        }
    }

    //ADVERSARIOS
    estouVivo = false;
    for(var i=0; i<jogadores.length; i++){
        //Desenhar
        if(jogadores[i].id != jogador.id){
            jogadores[i].desenhar();
            fill(255);
            textSize(20);
            strokeWeight(2);
            stroke(0);
            text(jogadores[i].nick, jogadores[i].x, jogadores[i].y+7);

            //Engolir
            hit = collidePointCircle(jogadores[i].x, jogadores[i].y ,jogador.x, jogador.y, jogador.raio);
            if(hit && jogador.emJogo && jogadores[i].raio <= jogador.raio*0.8 && jogador.raio > jogadores[i].raio){
                jogador.engolir(jogadores[i]);
            }
        }
        else{estouVivo = true;}
    }
    
    if(estouVivo){
        jogador.desenhar();
        jogador.checarVivo();
        textos();
    }
    if(estouVivo && frameCount % 60 == 0 && jogador.raio > 6){
        jogador.raio -= jogador.raio*0.008;
        socket.emit("atualizarPosicao", jogador);
    }
    
    for(var i=0; i<buracos.length; i++){
        hit = collideCircleCircle(jogador.x, jogador.y, jogador.raio, buracos[i].x, buracos[i].y, buracos[i].raio);
        if(hit && estouVivo){
            jogador.buraco();
        }
        buracos[i].desenhar();
    }
    
    if(!estouVivo && frameCount > 60 && jogador.emJogo){perdeu();}
    ranking();
    logo();
}

function seguirDedo(){
    if(!baixoFPS && jogador.emJogo){
        jogador.alvo = [mouseX/escala, mouseY/escala];
        jogador.seguirDedo(mouseX/escala, mouseY/escala);
        socket.emit("atualizarPosicao", jogador);
    }
    else{
        textSize(40);
        fill(255, 0, 0);
        if(baixoFPS){
            text("FPS BAIXO!", largura/2, altura/2+13);
        }
        else if(!jogador.emJogo){
            text("Digite um Nome!", largura/2, altura/2+13);
        }
    }

    if(!jogador.emJogo && mouseIsPressed && mouseY > 0 && mouseY < altura*escala){
        if(mouseX > 0 && mouseX < largura*escala){
            jogador.x = mouseX/escala;
            jogador.y = mouseY/escala;
        }
    }
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
    if(jogador.emJogo){
        window.scrollTo(0, document.body.scrollHeight);
        tela.position(windowWidth/2-tela.width/2, windowHeight/2-tela.height/2);
    }
}

function mousePressed(){
    if(touches.length > 1){jogador.atirar();}
}

// ======================================== ATUALIZADORES ========================================
function atualizarJogadores(lista){
    jogadores = [];
    for(var i=0; i<lista.length; i++){
        if(lista[i].emJogo || socket.id == lista[i].id){
            jogadores.push(new Adversario(lista[i].x, lista[i].y, lista[i].raio, lista[i].score, lista[i].id, lista[i].nick, lista[i].emJogo));
        }
    }
    if(lista.length == 0){
        jogadores = [];
    }
    //print("JOGADORES");
}

function atualizarComidas(lista){
    comidas = [];
    for(var i=0; i<lista.length; i++){
        comidas.push(new Comida(lista[i].x, lista[i].y, lista[i].raio, lista[i].id));
    }
    //print("COMIDAS");
}

function atualizarBuracos(lista){
    buracos = [];
    for(var i=0; i<lista.length; i++){
        buracos.push(new Buraco(lista[i].x, lista[i].y, lista[i].raio));
    }
    //print("BURACOS");
}

function atualizarBalas(lista){
    balas = [];
    for(var i=0; i<lista.length; i++){
        balas.push(new Bala(lista[i].x, lista[i].y, lista[i].velocidadeX, lista[i].velocidadeY, largura*0.02, lista[i].id, lista[i].codigo));
    }
    //print("BALAS");
}

// ===============================================================================================

function textos(){
    //Raio
    fill(180, 180, 0);
    textSize(14);
    text(jogador.raio.toFixed(1), jogador.x, jogador.y+15);
    //Nome
    fill(255, 255, 0);
    strokeWeight(2);
    stroke(0);
    textSize(20);
    text(jogador.nick, jogador.x, jogador.y);
    //Tiros Restantes
    fill(255, 0, 0);
    strokeWeight(2);
    stroke(0);
    textSize(20);
    tirosRestantes = floor((jogador.raio-30)/25) + 1;
    if(tirosRestantes > 0 || jogador.raio >= 30){text(".".repeat(tirosRestantes), jogador.x, jogador.y+20);}
    //Cronometro
    textAlign(RIGHT);
    textSize(16);
    text(relogio+" s", largura-2, 14);
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
    //baixoFPS = true;
}

function keyPressed(){
    if(keyCode == 13){concluirNick();}
    if(keyCode == 32){jogador.atirar();}
}

function doubleClicked(){
    jogador.atirar();
}

function usandoCookies(){
    c = document.cookie;
    c = c.split("=");
    if(c[1] != undefined){
        document.getElementById("nick").value = c[1];
    }
}

function concluirNick(){
    document.getElementById("nick").style.visibility = "hidden";
    document.getElementById("botao").style.visibility = "hidden";
    document.getElementById("menu").style.visibility = "hidden";
    window.scrollTo(0, document.body.scrollHeight);
    tela.position(windowWidth/2-tela.width/2, windowHeight/2-tela.height/2);
    document.body.style.overflow = "hidden";
    jogador.nick = document.getElementById("nick").value;
    document.cookie = "nick="+jogador.nick+"; expires=Fri, 31 Dec 9999 23:59:59 GMT";
    jogador.iniciar();
    novoNick = jogador.nick;
    socket.emit("novoNick", novoNick);
}

function ranking(){
    podio = [];

    for(var i=0; i<jogadores.length; i++){
        if(i < 3){
            if(podio.length == 0){podio.push(jogadores[i]);}
            else if(podio.length == 1){
                if(jogadores[i].raio > podio[0].raio){
                    podio.splice(0, 0, jogadores[i]);
                }
                else{
                    podio.push(jogadores[i]);
                }
            }
            else if(podio.length == 2){
                if(jogadores[i].raio > podio[0].raio){
                    podio.splice(0, 0, jogadores[i]);
                }
                else if(jogadores[i].raio > podio[1].raio){
                    podio.splice(1, 0, jogadores[i]);
                }
                else{
                    podio.push(jogadores[i]);
                }
            }
            else if(podio.length == 3){
                if(jogadores[i].raio > podio[0].raio){
                    podio.splice(0, 0, jogadores[i]);
                }
                else if(jogadores[i].raio > podio[1].raio){
                    podio.splice(1, 0, jogadores[i]);
                }
                else if(jogadores[i].raio > podio[2].raio){
                    podio.splice(2, 0, jogadores[i]);
                }
                else{
                    podio.push(jogadores[i]);
                }
            }
        }
        else{
            if(jogadores[i].raio > podio[0].raio){
                podio.splice(0, 0, jogadores[i]);
            }
            else if(jogadores[i].raio > podio[1].raio){
                podio.splice(1, 0, jogadores[i]);
            }
            else if(jogadores[i].raio > podio[2].raio){
                podio.splice(2, 0, jogadores[i]);
            }
        }
        if(podio.length > 3){podio.pop();}
    }

    //fill(200, 200, 200, 150);
    //rect(0, 0, 200, 100);
    textAlign(LEFT);
    noStroke();
    fill(50);
    textSize(17);
    if(podio.length > 0){text("1° - "+podio[0].nick+" ("+podio[0].raio.toFixed(1)+")", 5, 15);}
    textSize(14);
    if(podio.length > 1){text("2° - "+podio[1].nick+" ("+podio[1].raio.toFixed(1)+")", 5, 30);}
    textSize(11);
    if(podio.length > 2){text("3° - "+podio[2].nick+" ("+podio[2].raio.toFixed(1)+")", 5, 45);}
    textAlign(CENTER);
}

function perdeu(){
    menu();
}

function menu(){
    //FUNDO
    fill(255, 175, 175, 200);
    strokeWeight(2);
    stroke(0);
    rect(largura/2-150, altura/2-100, 300, 200, 20);
    //TEXTOS
    fill(255, 0, 0);
    textSize(38);
    text("Você Perdeu!", largura/2, altura/2-50);
    textSize(30);
    fill(255, 255, 0);
    text("Ponto: "+jogador.score.toFixed(2), largura/2, altura/2-10);
    text("Raio Final: "+jogador.raio.toFixed(1), largura/2, altura/2+25);
    //BOTAO
    fill(0, 255, 0);
    rect(largura/2-45, altura/2+45, 90, 40, 20);
    fill(255);
    textSize(28);
    text("Jogar!", largura/2, altura/2+73);

    //Pressionar Botao
    hit = collidePointRect(mouseX, mouseY, escala*largura/2-45, escala*altura/2+45, escala*90, escala*40);
    if(mouseIsPressed && hit){
        location.reload();
    }
}

function cronometro(dados){
    relogio = dados.tempo;
    if(relogio <= 0){
        //FUNDO
        fill(255, 175, 175);
        strokeWeight(2);
        stroke(0);
        rect(largura/2-150, altura/2-100, 300, 200, 20);
        //TEXTO
        fill(255, 0, 0);
        textAlign(CENTER);
        textSize(40);
        text("Resultado Final", largura/2, altura/2-60);
        fill(50);
        textSize(25);
        fill(255, 255, 0);
        if(podio.length > 0){text("1° - "+podio[0].nick+" ("+podio[0].raio.toFixed(1)+")", largura/2, altura/2);}
        textSize(20);
        fill(180);
        if(podio.length > 1){text("2° - "+podio[1].nick+" ("+podio[1].raio.toFixed(1)+")", largura/2, altura/2+35);}
        textSize(15);
        fill(245, 92, 0);
        if(podio.length > 2){text("3° - "+podio[2].nick+" ("+podio[2].raio.toFixed(1)+")", largura/2, altura/2+70);}
        noLoop();
    }
    if(dados.contagemRegressiva <= 0){
        location.reload();
    }
}

function logo(){
    noStroke();
    fill(175, 0, 0);
    textSize(12);
    textAlign(LEFT);
    text("Fabricio Junior", 2, altura-2);
}

window.onbeforeunload = function(event) {
    return 'Dialog text here.';
 };