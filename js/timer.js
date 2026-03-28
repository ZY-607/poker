class TimerManager {
    constructor() {
        this.timerId = null;
        this.remainingSeconds = 60;
        this.maxSeconds = 60;
        this.warningThreshold = 10;
        this.criticalThreshold = 5;
        this.onTimeout = null;
        this.isActive = false;
        this.circumference = 283;
    }

    start(callback, seconds = 60) {
        this.stop();
        this.maxSeconds = seconds;
        this.remainingSeconds = seconds;
        this.onTimeout = callback;
        this.isActive = true;
        this.updateDisplay();
        this.timerId = setInterval(() => this.tick(), 1000);
    }

    stop() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
        this.isActive = false;
        this.hideDisplay();
    }

    reset() {
        this.stop();
        this.remainingSeconds = this.maxSeconds;
    }

    tick() {
        this.remainingSeconds--;
        this.updateDisplay();

        if (this.remainingSeconds <= 0) {
            this.stop();
            if (this.onTimeout) {
                this.onTimeout();
            }
        }
    }

    updateDisplay() {
        const ring = document.getElementById('player-timer-ring');
        const progress = document.getElementById('player-timer-progress');
        const text = document.getElementById('player-timer-text');
        
        if (!ring || !progress || !text) return;

        ring.classList.add('active');
        text.innerText = this.remainingSeconds;

        const percentage = this.remainingSeconds / this.maxSeconds;
        const offset = this.circumference * (1 - percentage);
        progress.style.strokeDashoffset = offset;

        ring.classList.remove('warning', 'critical');
        
        if (this.remainingSeconds <= this.criticalThreshold) {
            ring.classList.add('critical');
        } else if (this.remainingSeconds <= this.warningThreshold) {
            ring.classList.add('warning');
        }
    }

    hideDisplay() {
        const ring = document.getElementById('player-timer-ring');
        if (ring) {
            ring.classList.remove('active', 'warning', 'critical');
        }
    }

    getRemainingSeconds() {
        return this.remainingSeconds;
    }

    isRunning() {
        return this.isActive;
    }
}

const timerManager = new TimerManager();
