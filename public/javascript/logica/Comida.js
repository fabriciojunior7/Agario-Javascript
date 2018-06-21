function Comida(x, y, raio, id){
    
    //ATRIBUTOS
    rosa = color(255, 0, 102);
    verde = color(0, 180, 0);
    laranja = color(255, 102, 0);
    /*r = round(random(1,2));
    switch(r){
        case 1:
            cor = verde;
            break;
        case 2:
            cor = laranja;
            break;
    }*/

    Entidade.call(this, x, y, raio, verde);
    this.id = id;

    //METODOS
    this.comer = function(){
        jogador.comer(this);
        socket.emit("comeu", this.id);
    }

}