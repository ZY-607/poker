const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const RoomManager = require('./room_manager');
const UserManager = require('./user_manager');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files from the parent directory (project root)
app.use(express.static(path.join(__dirname, '../')));

const roomManager = new RoomManager(io);
const userManager = new UserManager();
roomManager.setUserManager(userManager); // Inject UserManager

// Map socket.id -> username (Session management)
const sessions = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    // Send room list immediately
    socket.emit('roomList', roomManager.getPublicRoomList());

    // --- Auth Events ---

    socket.on('login', ({ username, password }) => {
        const result = userManager.login(username, password);
        if (result.success) {
            sessions[socket.id] = result.user.username;
            socket.emit('loginSuccess', result.user);
            console.log(`User logged in: ${result.user.username}`);
        } else {
            socket.emit('loginError', result.error);
        }
    });

    socket.on('register', ({ username, password, avatarId }) => {
        const result = userManager.register(username, password, avatarId);
        if (result.success) {
            sessions[socket.id] = result.user.username;
            socket.emit('registerSuccess', result.user);
            console.log(`New user registered: ${result.user.username}`);
        } else {
            socket.emit('registerError', result.error);
        }
    });

    // Auto-login / Reconnect check (if needed later)
    // For now, client sends 'login' with saved creds

    // --- Game Events ---

    // Client requests to refresh room list
    socket.on('getRoomList', () => {
        socket.emit('roomList', roomManager.getPublicRoomList());
    });

    // Client requests to create a room
    socket.on('createRoom', ({ password }) => {
        const username = sessions[socket.id];
        if (!username) {
            socket.emit('error', '请先登录');
            return;
        }
        
        const userProfile = userManager.getUser(username);
        // Sync chips from server to room? Or room uses its own logic?
        // Plan: Room takes user's current chips.
        
        const roomId = roomManager.createRoom(password);
        // Note: joinRoom now expects just roomId and password, user info comes from session/server
        const result = roomManager.joinRoom(roomId, socket, userProfile.username, password, userProfile);
        
        if (result.success) {
            socket.emit('roomCreated', { roomId });
        } else {
            socket.emit('error', 'Failed to create room: ' + result.error);
        }
    });

    // Client requests to join a room
    socket.on('joinRoom', ({ roomId, password }) => {
        const username = sessions[socket.id];
        if (!username) {
            socket.emit('error', '请先登录');
            return;
        }
        
        const userProfile = userManager.getUser(username);
        const result = roomManager.joinRoom(roomId, socket, userProfile.username, password, userProfile);
        
        if (!result.success) {
            if (result.error === 'INVALID_PASSWORD') {
                socket.emit('joinError', { code: 'INVALID_PASSWORD', msg: '密码错误' });
            } else if (result.error === 'ROOM_FULL') {
                socket.emit('error', '房间已满');
            } else {
                socket.emit('error', '房间不存在');
            }
        }
    });

    // Client sends an action (fold, call, raise, check)
    socket.on('action', (data) => {
        roomManager.handleAction(socket.id, data);
    });

    // Host starts the game
    socket.on('startGame', () => {
        roomManager.startGame(socket.id);
    });

    // Client updates balance (e.g. from single player mode)
    socket.on('updateBalance', (amount) => {
        const username = sessions[socket.id];
        if (username) {
            userManager.updateChips(username, amount);
        }
    });

    // Sync full profile from client to server
    socket.on('syncProfile', (profileData) => {
        const username = sessions[socket.id];
        if (username) {
            userManager.updateProfile(username, profileData);
            socket.emit('syncSuccess', { message: '数据同步成功' });
        }
    });

    // Get full profile from server
    socket.on('getProfile', () => {
        const username = sessions[socket.id];
        if (username) {
            const profile = userManager.getFullProfile(username);
            socket.emit('profileData', profile);
        }
    });

    // Record a hand result (for single player mode)
    socket.on('recordHand', (result) => {
        const username = sessions[socket.id];
        if (username) {
            userManager.recordHand(username, result);
        }
    });

    // Unlock achievement
    socket.on('unlockAchievement', (achievementId) => {
        const username = sessions[socket.id];
        if (username) {
            const isNew = userManager.unlockAchievement(username, achievementId);
            if (isNew) {
                socket.emit('achievementUnlocked', achievementId);
            }
        }
    });

    // Client disconnects
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        const username = sessions[socket.id];
        if (username) {
            // Optional: Handle user "offline" status if needed
            delete sessions[socket.id];
        }
        roomManager.handleDisconnect(socket.id);
    });
});

server.listen(PORT, HOST, () => {
    console.log(`========================================`);
    console.log(`德州扑克服务器已启动`);
    console.log(`本地访问: http://localhost:${PORT}`);
    console.log(`Railway 部署: 请查看 Railway 控制台获取公网地址`);
    console.log(`========================================`);
});
