function Comida(x, y, raio, id){
    
    //ATRIBUTOS
    cor = color(0, 255, 0);
    Entidade.call(this, x, y, raio, cor);
    this.id = id;

    //METODOS
    this.comer = function(){
        jogador.comer(this);
        socket.emit("comeu", this.id);
    }

}