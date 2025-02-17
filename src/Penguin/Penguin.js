module.exports =  class Penguin {
    constructor({name, damage}) {
        this.name = name;
        this.damageD = damageD;

        this.onLoseCallback = null;
    }
    
    attack(damage) {
        this.damageD -= damage;
        if(this.damageD <= 0) {
            this.onLoseCallback(this)
        }
    }
    
    onLose(fn) {
        this.onLoseCallback = fn;
    }

}