class TimerManager {
    constructor() {
        this.timerId = null;
        this.remainingSeconds = 60;
        this.maxSeconds = 60;
        this.warningThreshold = 10;
        this.criticalThreshold = 5;
        this.onTimeout = null;
        this.onTick = null;
        this.isActive = false;
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

        if (this.onTick) {
            this.onTick(this.remainingSeconds);
        }

        if (this.remainingSeconds <= 0) {
            this.stop();
            if (this.onTimeout) {
                this.onTimeout();
            }
        }
    }

    updateDisplay() {
        const container = document.getElementById('action-timer');
        const display = document.getElementById('timer-display');
        const progressBar = document.getElementById('timer-progress-bar');
        
        if (!container || !display) return;

        container.style.display = 'flex';
        display.innerText = this.formatTime(this.remainingSeconds);

        if (progressBar) {
            const percentage = (this.remainingSeconds / this.maxSeconds) * 100;
            progressBar.style.width = `${percentage}%`;
        }

        container.classList.remove('warning', 'critical');
        
        if (this.remainingSeconds <= this.criticalThreshold) {
            container.classList.add('critical');
        } else if (this.remainingSeconds <= this.warningThreshold) {
            container.classList.add('warning');
        }
    }

    hideDisplay() {
        const container = document.getElementById('action-timer');
        if (container) {
            container.style.display = 'none';
            container.classList.remove('warning', 'critical');
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    getRemainingSeconds() {
        return this.remainingSeconds;
    }

    isRunning() {
        return this.isActive;
    }
}

const timerManager = new TimerManager();
