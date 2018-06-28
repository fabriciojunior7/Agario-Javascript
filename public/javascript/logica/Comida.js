function Comida(x, y, raio, id){
    
    //ATRIBUTOS
    verde = color(0, 180, 0);

    Entidade.call(this, x, y, raio, verde);
    this.id = id;

    //METODOS
    this.comer = function(){
        jogador.comer(this);
        socket.emit("comeu", this.id);
    }

}