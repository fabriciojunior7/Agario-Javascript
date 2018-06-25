function Adversario(x, y, raio, score, id, nick, emJogo){
    
    //ATRIBUTOS
    cor = color(255, 0, 0);
    Entidade.call(this, x, y, raio, cor);
    this.score = score;
    this.id = id;
    this.nick = nick;
    this.emJogo = emJogo;
}