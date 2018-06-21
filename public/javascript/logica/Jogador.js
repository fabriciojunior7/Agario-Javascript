function Jogador(){
    
    //ATRIBUTOS
    Entidade.call(this, round(random(5, largura-5)), round(random(5, altura-5)), 5, color(0, 0, 255));
    this.velocidade = 5;
    this.score = 0;
    this.maxScore = 0;
    this.wasd = [false, false, false, false];
    this.alvo = [0, 0];
    this.id = "";
    this.nick = "";

    //Metodos
    this.mover = function(){
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
    }

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

        this.corrigirPosicao();
    }

    this.corrigirPosicao = function(){
        //EIXO X
        if(this.x < this.raio/2){this.x = this.raio/2;}
        if(this.x > largura-this.raio/2){this.x = largura-this.raio/2;}

        if(this.y < this.raio/2){this.y = this.raio/2;}
        if(this.y > altura-this.raio/2){this.y = altura-this.raio/2;}
    }

    this.comer = function(comida){
        this.score += comida.raio/4;
        this.raio += comida.raio/4;
        this.velocidade = 5 - (this.raio/50);
        if(this.velocidade < 0.25){this.velocidade = 0.25;}
    }

    this.reset = function(){
        this.x = round(random(5, largura-5));
        this.y = round(random(5, altura-5));
    }

}