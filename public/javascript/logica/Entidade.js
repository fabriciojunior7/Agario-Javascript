function Entidade(x, y, raio, cor){
    
    //ATRIBUTOS
    this.x = x;
    this.y = y;
    this.raio = raio;
    this.cor = cor

    //METODOS
    this.desenhar = function(){
        noStroke();
        fill(this.cor);
        ellipse(this.x, this.y, this.raio, this.raio);
    }

}