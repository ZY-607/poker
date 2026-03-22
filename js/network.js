class NetworkManager {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.listeners = {};
        this.currentUser = null;
    }

    connect() {
        if (this.socket) return;
        
        this.socket = io();

        const handleEvent = (event, data) => {
            if (this.listeners[event]) {
                this.listeners[event].forEach(cb => cb(data));
            }
        };

        this.socket.on('connect', () => {
            console.log('Connected to server:', this.socket.id);
            this.isConnected = true;
            handleEvent('connect');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.isConnected = false;
            handleEvent('disconnect');
        });

        this.socket.on('error', (msg) => {
            alert('Error: ' + msg);
            handleEvent('error', msg);
        });

        const events = [
            'roomCreated', 'updateState', 'playerAction', 
            'gameStart', 'gameOver', 'message', 
            'roomList', 'joinError',
            'loginSuccess', 'loginError',
            'registerSuccess', 'registerError',
            'syncSuccess', 'profileData', 'achievementUnlocked'
        ];

        events.forEach(evt => {
            this.socket.on(evt, (data) => handleEvent(evt, data));
        });
    }

    login(username, password) {
        this.socket.emit('login', { username, password });
    }

    register(username, password, avatarId) {
        this.socket.emit('register', { username, password, avatarId });
    }

    createRoom(password) {
        this.socket.emit('createRoom', { password });
    }

    joinRoom(roomId, password) {
        this.socket.emit('joinRoom', { roomId, password });
    }

    getRoomList() {
        this.socket.emit('getRoomList');
    }

    sendAction(action, amount) {
        this.socket.emit('action', { action, amount });
    }

    updateBalance(amount) {
        if (this.isConnected && this.socket) {
            this.socket.emit('updateBalance', amount);
        }
    }

    syncProfile(profileData) {
        if (this.isConnected && this.socket) {
            this.socket.emit('syncProfile', profileData);
        }
    }

    getProfile() {
        if (this.isConnected && this.socket) {
            this.socket.emit('getProfile');
        }
    }

    recordHand(result) {
        if (this.isConnected && this.socket) {
            this.socket.emit('recordHand', result);
        }
    }

    unlockAchievement(achievementId) {
        if (this.isConnected && this.socket) {
            this.socket.emit('unlockAchievement', achievementId);
        }
    }

    setCurrentUser(user) {
        this.currentUser = user;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.currentUser = null;
        }
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }
    
    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
}

const networkManager = new NetworkManager();
