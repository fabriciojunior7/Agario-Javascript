function Buraco(x, y, raio){
    
    //ATRIBUTOS
    cor = color(102, 51, 0);
    Entidade.call(this, x, y, raio, cor);

    //METODOS
    this.desenhar = function(){
        strokeWeight(3);
        stroke(0);
        fill(this.cor);
        ellipse(this.x, this.y, this.raio, this.raio);
    }
}