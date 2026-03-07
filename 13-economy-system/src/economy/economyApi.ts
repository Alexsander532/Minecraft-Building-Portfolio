import { http, HttpRequest, HttpRequestMethod, HttpHeader } from "@minecraft/server-net";

const API_URL = "http://localhost:3002";

export interface BalanceResponse {
    id: string;
    coins: number;
}

export interface TransactionResponse {
    id: string;
    coins: number;
    success: boolean;
}

export interface LeaderboardEntry {
    id: string;
    coins: number;
    rank: number;
}

async function apiRequest<T>(method: HttpRequestMethod, endpoint: string, body?: object): Promise<T> {
    const request = new HttpRequest(`${API_URL}${endpoint}`);
    request.method = method;
    request.headers = [new HttpHeader("Content-Type", "application/json")];

    if (body) {
        request.body = JSON.stringify(body);
    }

    const response = await http.request(request);

    if (response.status !== 200) {
        throw new Error(`API error ${response.status}: ${response.body}`);
    }

    return JSON.parse(response.body) as T;
}

export async function getBalance(playerId: string): Promise<number> {
    const data = await apiRequest<BalanceResponse>(HttpRequestMethod.Get, `/balance?id=${encodeURIComponent(playerId)}`);
    return data.coins;
}

export async function addCoins(playerId: string, amount: number): Promise<TransactionResponse> {
    return apiRequest<TransactionResponse>(HttpRequestMethod.Post, "/addCoins", {
        id: playerId,
        amount,
    });
}

export async function removeCoins(playerId: string, amount: number): Promise<TransactionResponse> {
    return apiRequest<TransactionResponse>(HttpRequestMethod.Post, "/removeCoins", {
        id: playerId,
        amount,
    });
}

export async function transferCoins(fromId: string, toId: string, amount: number): Promise<TransactionResponse> {
    return apiRequest<TransactionResponse>(HttpRequestMethod.Post, "/transfer", {
        from: fromId,
        to: toId,
        amount,
    });
}

export async function getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    return apiRequest<LeaderboardEntry[]>(HttpRequestMethod.Get, `/leaderboard?limit=${limit}`);
}
