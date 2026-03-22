class DataManager {
    static KEY = 'texasholdem_profile_cache_v1';
    static _serverData = null;
    static _isLoggedIn = false;

    static get defaultProfile() {
        return {
            chips: 10000,
            nickname: '玩家',
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
    }

    static setServerData(data) {
        this._serverData = data;
        this._isLoggedIn = true;
        this._saveToCache(data);
    }

    static getIsLoggedIn() {
        return this._isLoggedIn;
    }

    static load() {
        if (this._isLoggedIn && this._serverData) {
            return this._serverData;
        }
        
        const data = localStorage.getItem(this.KEY);
        if (!data) return this.defaultProfile;
        try {
            const parsed = JSON.parse(data);
            return { ...this.defaultProfile, ...parsed, stats: { ...this.defaultProfile.stats, ...parsed.stats } };
        } catch (e) {
            console.error("Data load error", e);
            return this.defaultProfile;
        }
    }

    static _saveToCache(data) {
        try {
            localStorage.setItem(this.KEY, JSON.stringify(data));
        } catch (e) {
            console.error("Cache save error", e);
        }
    }

    static save(data) {
        this._serverData = data;
        this._saveToCache(data);
        
        if (this._isLoggedIn && networkManager && networkManager.isConnected) {
            networkManager.syncProfile({
                chips: data.chips,
                nickname: data.nickname,
                avatar: data.avatar,
                stats: data.stats,
                history: data.history,
                achievements: data.achievements
            });
        }
    }

    static updateChips(amount) {
        const data = this.load();
        data.chips = amount;
        this.save(data);
    }

    static updateProfile(nickname, avatar) {
        const data = this.load();
        if (nickname !== undefined) data.nickname = nickname;
        if (avatar !== undefined) data.avatar = avatar;
        this.save(data);
    }

    static getNickname() {
        const data = this.load();
        return data.nickname || '玩家';
    }

    static getAvatar() {
        const data = this.load();
        return data.avatar !== undefined ? data.avatar : 0;
    }

    static recordHand(result) {
        const data = this.load();
        
        data.stats.totalHands++;
        if (result.profit > 0) {
            data.stats.wins++;
            if (result.hand && result.hand.rank) {
                if (!data.stats.rankWins) data.stats.rankWins = {};
                if (!data.stats.rankWins[result.hand.rank]) data.stats.rankWins[result.hand.rank] = 0;
                data.stats.rankWins[result.hand.rank]++;
            }
        }
        data.stats.totalProfit += result.profit;
        
        if (result.profit > 0 && result.pot > data.stats.biggestPot) {
            data.stats.biggestPot = result.pot;
        }

        if (result.hand && result.hand.rank > data.stats.bestHand.rank) {
            data.stats.bestHand = {
                rank: result.hand.rank,
                name: result.hand.name,
                cards: result.cards || []
            };
        }

        const historyItem = {
            date: new Date().toLocaleString(),
            profit: result.profit,
            handName: result.hand ? result.hand.name : '弃牌',
            pot: result.pot
        };
        data.history.unshift(historyItem);
        if (data.history.length > 20) data.history.pop();

        this.save(data);
    }
    
    static reset() {
        this._serverData = null;
        this._isLoggedIn = false;
        localStorage.removeItem(this.KEY);
        return this.defaultProfile;
    }

    static logout() {
        this._serverData = null;
        this._isLoggedIn = false;
    }

    static syncToServer() {
        if (this._isLoggedIn && networkManager && networkManager.isConnected) {
            const data = this.load();
            networkManager.syncProfile({
                chips: data.chips,
                nickname: data.nickname,
                avatar: data.avatar,
                stats: data.stats,
                history: data.history,
                achievements: data.achievements
            });
        }
    }
}
