const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'users.json');

const DEFAULT_USER_DATA = {
    chips: 10000,
    nickname: '',
    avatar: 0,
    stats: {
        totalHands: 0,
        wins: 0,
        totalProfit: 0,
        biggestPot: 0,
        bestHand: { rank: 0, name: "无", cards: [] },
        rankWins: {}
    },
    history: [],
    achievements: []
};

class UserManager {
    constructor() {
        this.users = {};
        this.load();
    }

    load() {
        try {
            if (fs.existsSync(DATA_FILE)) {
                const data = fs.readFileSync(DATA_FILE, 'utf8');
                this.users = JSON.parse(data);
            } else {
                this.save();
            }
        } catch (e) {
            console.error('Error loading users:', e);
            this.users = {};
        }
    }

    save() {
        try {
            const dir = path.dirname(DATA_FILE);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(DATA_FILE, JSON.stringify(this.users, null, 2));
        } catch (e) {
            console.error('Error saving users:', e);
        }
    }

    register(username, password, avatarId) {
        if (this.users[username]) {
            return { success: false, error: 'USERNAME_EXISTS' };
        }

        this.users[username] = {
            username: username,
            password: password,
            ...JSON.parse(JSON.stringify(DEFAULT_USER_DATA)),
            avatar: avatarId || 0,
            nickname: username,
            regDate: new Date().toISOString()
        };

        this.save();
        return { success: true, user: this.getFullProfile(username) };
    }

    login(username, password) {
        const user = this.users[username];
        if (!user) {
            return { success: false, error: 'USER_NOT_FOUND' };
        }
        if (user.password !== password) {
            return { success: false, error: 'WRONG_PASSWORD' };
        }
        return { success: true, user: this.getFullProfile(username) };
    }

    getUser(username) {
        return this.users[username];
    }

    getPublicProfile(username) {
        const user = this.users[username];
        if (!user) return null;
        return {
            username: user.username,
            avatar: user.avatar,
            chips: user.chips,
            nickname: user.nickname || user.username
        };
    }

    getFullProfile(username) {
        const user = this.users[username];
        if (!user) return null;
        return {
            username: user.username,
            avatar: user.avatar !== undefined ? user.avatar : 0,
            nickname: user.nickname || user.username,
            chips: user.chips,
            stats: user.stats || DEFAULT_USER_DATA.stats,
            history: user.history || [],
            achievements: user.achievements || []
        };
    }

    updateChips(username, amount) {
        if (this.users[username]) {
            this.users[username].chips = amount;
            this.save();
            return true;
        }
        return false;
    }

    updateProfile(username, data) {
        if (!this.users[username]) return false;
        
        const user = this.users[username];
        
        if (data.nickname !== undefined) {
            user.nickname = data.nickname;
        }
        if (data.avatar !== undefined) {
            user.avatar = data.avatar;
        }
        if (data.chips !== undefined) {
            user.chips = data.chips;
        }
        if (data.stats !== undefined) {
            user.stats = data.stats;
        }
        if (data.history !== undefined) {
            user.history = data.history;
        }
        if (data.achievements !== undefined) {
            user.achievements = data.achievements;
        }
        
        this.save();
        return true;
    }

    recordHand(username, result) {
        const user = this.users[username];
        if (!user) return false;

        if (!user.stats) {
            user.stats = JSON.parse(JSON.stringify(DEFAULT_USER_DATA.stats));
        }
        
        user.stats.totalHands++;
        if (result.profit > 0) {
            user.stats.wins++;
            if (result.hand && result.hand.rank) {
                if (!user.stats.rankWins) user.stats.rankWins = {};
                if (!user.stats.rankWins[result.hand.rank]) user.stats.rankWins[result.hand.rank] = 0;
                user.stats.rankWins[result.hand.rank]++;
            }
        }
        user.stats.totalProfit += result.profit;
        
        if (result.profit > 0 && result.pot > user.stats.biggestPot) {
            user.stats.biggestPot = result.pot;
        }

        if (result.hand && result.hand.rank > user.stats.bestHand.rank) {
            user.stats.bestHand = {
                rank: result.hand.rank,
                name: result.hand.name,
                cards: result.cards || []
            };
        }

        if (!user.history) user.history = [];
        const historyItem = {
            date: new Date().toLocaleString(),
            profit: result.profit,
            handName: result.hand ? result.hand.name : '弃牌',
            pot: result.pot
        };
        user.history.unshift(historyItem);
        if (user.history.length > 20) user.history.pop();

        this.save();
        return true;
    }

    unlockAchievement(username, achievementId) {
        const user = this.users[username];
        if (!user) return false;

        if (!user.achievements) user.achievements = [];
        if (!user.achievements.includes(achievementId)) {
            user.achievements.push(achievementId);
            this.save();
            return true;
        }
        return false;
    }
}

module.exports = UserManager;
