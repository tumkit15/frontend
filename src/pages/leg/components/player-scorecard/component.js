
const CLASS_DART_SINGLE = 'dart-score-single';
const CLASS_DART_DOUBLE = 'dart-score-double';
const CLASS_DART_TRIPLE = 'dart-score-triple';

const DART_CONTAINER_MAP = { 1: 'first', 2: 'second', 3: 'third' };

module.exports = {
    onInput(input) {
        var player = input.player;
        this.state = {
            isCurrentPlayer: player.is_current_player,
            totalScore: 0,
            currentDart: 1,
            isSubmitted: true
        }
    },
    getCurrentDart() {
        return this.getComponent(DART_CONTAINER_MAP[this.state.currentDart]);
    },
    getCurrentValue() {
        var dart = this.getCurrentDart();
        return dart ? dart.state.value : 0;
    },
    getCurrentMultiplier() {
        var dart = this.getCurrentDart()
        return dart ? dart.state.multiplier : 1;
    },
    removeLast() {
        if (this.state.currentDart <= 1 && this.state.isSubmitted) {
            return;
        }
        if (this.state.isSubmitted) {
            this.state.currentDart--;
            var dart = this.getCurrentDart();
            this.state.totalScore -= dart.getValue();
            dart.reset();
        } else {
            var dart = this.getCurrentDart()
            dart.reset();
        }
    },
    confirmThrow() {
        if (this.state.currentDart <= 3) {
            var value = this.getCurrentDart().getValue();
            if (value === 0) {
                this.setDart(0, 1);
            }
            this.state.totalScore += value;
            this.state.currentDart++;
            this.state.isSubmitted = true;
        }
        return this.state.currentDart - 1;
    },
    setDart(value, multiplier) {
        this.getCurrentDart().setDart(value, multiplier);
    }
};