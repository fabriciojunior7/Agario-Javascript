function Jogador(){
    
    //ATRIBUTOS
    Entidade.call(this, round(random(5, largura-5)), round(random(5, altura-5)), 5, color(0, 0, 255));
    this.velocidadeMax = 6;
    this.velocidadeMin = 0.5;
    this.velocidade = this.velocidadeMax;
    this.raioMax = largura*0.6;
    this.score = 0;
    //this.maxScore = 0;
    //this.wasd = [false, false, false, false];
    this.alvo = [0, 0];
    this.id = "";
    this.nick = "";
    this.emJogo = false;
    this.comidasComidas = [];

    //Metodos
    /*this.mover = function(){
        //EIXO Y
        if(this.wasd[0] && this.y > this.raio/2){
            this.y -= this.velocidade;
        }
        else if(this.wasd[2] && this.y < altura-this.raio/2){
            this.y += this.velocidade;
        }
        
        //EIXO X
        if(this.wasd[1] && this.x > this.raio/2){
            this.x -= this.velocidade;
        }
        else if(this.wasd[3] && this.x < largura-this.raio/2){
            this.x += this.velocidade;
        }
        this.corrigirPosicao();
    }

    this.botaoPressionado = function(key){
        //EIXO Y
        if(key == 38 || key == 87){
            this.wasd[0] = true;
        }
        else if(key == 40 || key == 83){
            this.wasd[2] = true;
        }

        //EIXO X
        if(key == 37 || key == 65){
            this.wasd[1] = true;
        }
        else if(key == 39 || key == 68){
            this.wasd[3] = true;
        }
    }

    this.botaoSolto = function(key){
        //EIXO Y
        if(key == 38 || key == 87){
            this.wasd[0] = false;
        }
        else if(key == 40 || key == 83){
            this.wasd[2] = false;
        }

        //EIXO X
        if(key == 37 || key == 65){
            this.wasd[1] = false;
        }
        else if(key == 39 || key == 68){
            this.wasd[3] = false;
        }
    }*/

    this.seguirDedo = function(mx, my){
        distX = abs(this.x - mx);
        distY = abs(this.y - my);
        hipotenusa = dist(this.x, this.y, mx, my);
        seno = distX/hipotenusa;
        cosseno = distY/hipotenusa;

        //EIXO X
        if(this.alvo[0] < this.x && this.x > this.raio/2){this.x -= this.velocidade*seno;}
        else if(this.alvo[0] > this.x && this.x < largura-this.raio/2){this.x += this.velocidade*seno;}

        //EIXO y
        if(this.alvo[1] < this.y && this.y > this.raio/2){this.y -= this.velocidade*cosseno;}
        else if(this.alvo[1] > this.y && this.y < altura-this.raio/2){this.y += this.velocidade*cosseno;}

        if(hipotenusa <= this.velocidade){
            this.x = mx;
            this.y = my;
        }
        this.correcoes();
    }

    this.correcoes = function(){
        //EIXO X
        if(this.x < this.raio/2){this.x = this.raio/2;}
        if(this.x > largura-this.raio/2){this.x = largura-this.raio/2;}
        //EIXO Y
        if(this.y < this.raio/2){this.y = this.raio/2;}
        if(this.y > altura-this.raio/2){this.y = altura-this.raio/2;}
        //RAIO
        this.raioMax = floor(largura*0.6);
        if(this.raio < 5){this.raio += 0.5;}
        if(this.raio > this.raioMax){this.raio = this.raioMax;}
        //VELOCIDADE
        this.ajustarVelocidade();

    }

    this.comer = function(comida){
        if(!this.jaComeu(comida)){
            this.score += comida.raio/4;
            this.raio += comida.raio/4;
            this.correcoes();
            this.comidasComidas.push(comida.id);
            if(this.comidasComidas.length > 100){this.limparComidas();}
        }
    }

    this.engolir = function(adverdasio){
        this.raio += adverdasio.raio;
        this.score += adverdasio.raio;
        this.correcoes();
        jogadores.splice(adverdasio.id, 1);
        socket.emit("engolir", adverdasio.id);
    }

    this.buraco = function(){
        if(this.emJogo){
            this.raio -= 5;
            this.correcoes();
        }
    }

    this.reset = function(){
        this.x = round(random(5, largura-5));
        this.y = round(random(5, altura-5));
    }

    this.iniciar = function(){
        this.emJogo = true;
    }

    this.atirar = function(){
        if(this.raio >= 30){
            this.raio -= 20;
            this.correcoes();
            socket.emit("atirar", this);
        }
    }

    this.atingirBala = function(bala){
        this.raio -= 30;
        this.correcoes();
    }

    this.checarVivo = function(){
        if(jogador.raio <= 0){
            estouVivo = false;
            jogador.raio = 0;
            socket.emit("engolir", jogador.id);
        }
    }

    this.limparComidas = function(){
        this.comidasComidas.splice(0, 10);
    }

    this.jaComeu = function(comida){
        jaComeu = false;
        for(var i=0; i<this.comidasComidas.length; i++){
            if(comida.id == this.comidasComidas[i]){
                jaComeu = true;
                break;
            }
        }
        return jaComeu;
    }

    this.ajustarVelocidade = function(){
        x = (this.velocidadeMax - this.velocidadeMin)/(this.raioMax - 50);
        this.velocidade = this.velocidadeMax - (this.raio * x);
        if(this.velocidade < this.velocidadeMin){this.velocidade = this.velocidadeMin;}
    }

}