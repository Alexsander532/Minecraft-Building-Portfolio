export interface ScoreEntry {
    playerId: string;
    name: string;
    score: number;
}

class ScoreboardManager {

    private scores: Map<string, Map<string, ScoreEntry>> = new Map();

    setScore(gameId: string, playerId: string, name: string, score: number): void {
        let gameScores = this.scores.get(gameId);
        if (!gameScores) {
            gameScores = new Map();
            this.scores.set(gameId, gameScores);
        }
        gameScores.set(playerId, { playerId, name, score });
    }

    addScore(gameId: string, playerId: string, name: string, amount: number): number {
        let gameScores = this.scores.get(gameId);
        if (!gameScores) {
            gameScores = new Map();
            this.scores.set(gameId, gameScores);
        }

        const current = gameScores.get(playerId);
        const newScore = (current?.score ?? 0) + amount;
        gameScores.set(playerId, { playerId, name, score: newScore });
        return newScore;
    }

    getScore(gameId: string, playerId: string): number {
        return this.scores.get(gameId)?.get(playerId)?.score ?? 0;
    }

    getRanking(gameId: string): ScoreEntry[] {
        const gameScores = this.scores.get(gameId);
        if (!gameScores) return [];

        return [...gameScores.values()].sort((a, b) => b.score - a.score);
    }

    getWinner(gameId: string): ScoreEntry | undefined {
        const ranking = this.getRanking(gameId);
        return ranking[0];
    }

    resetGame(gameId: string): void {
        this.scores.delete(gameId);
    }

    formatScoreboard(gameId: string): string[] {
        const ranking = this.getRanking(gameId);
        if (ranking.length === 0) return ["§7No scores yet."];

        return ranking.map((entry, i) => {
            const medal = i === 0 ? "§6🥇" : i === 1 ? "§f🥈" : i === 2 ? "§c🥉" : "§7  ";
            return `${medal} §f${entry.name} §7- §e${entry.score}`;
        });
    }
}

export const scoreboardManager = new ScoreboardManager();
