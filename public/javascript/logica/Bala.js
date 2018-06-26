function Bala(x, y, velocidadeX, velocidadeY, raio, id){
    
    //ATRIBUTOS
    cor = color(0, 0, 0);
    Entidade.call(this, x, y, raio, cor);
    this.corAtual = 1;
    this.velocidadeX = velocidadeX;
    this.velocidadeY = velocidadeY;
    this.id = id;

    //METODOS
    this.desenhar = function(){
        preto = color(0, 0, 0);
        vermelho = color(255, 0, 0);
        
        if(frameCount % 3 == 0){
            if(this.corAtual == 1){this.cor = vermelho; this.corAtual = 2;}
            else{this.cor = preto; this.corAtual = 1;}
        }

        strokeWeight(1);
        stroke(255);
        fill(this.cor);
        ellipse(this.x, this.y, this.raio, this.raio);
    }
}