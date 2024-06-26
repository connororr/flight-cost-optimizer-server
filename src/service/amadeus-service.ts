import { AccessTokenResponse } from '../constants/external-api/response';
import 'dotenv/config'



export interface IAmadeusService {
    post(endpoint: string, body: unknown): Promise<unknown>;
    get(endpoint: string, searchParams: URLSearchParams): Promise<unknown>;
}

type HTTPMethod = 'POST' | 'GET'

export class AmadeusService implements IAmadeusService {
    private _accessToken: string = '';
    private _amadeusBaseUrl: string = 'https://api.amadeus.com';


    constructor(private _accessTokenTimestamp: number = 0) {}
    public async post(endpoint: string, body: unknown): Promise<unknown> {
        const method = 'POST';
        const elapsedTime = (Date.now() - this._accessTokenTimestamp) / (1000 * 60);
        if (elapsedTime > 20) {
            this._accessToken = await this.getAccessToken();
        }
        
        // TODO: figure out the right type
        const requestOptions = {
            method,
            headers: this.generateDefaultHeaders(method),
            body: JSON.stringify(body)
        }
        return fetch(`${this._amadeusBaseUrl}${endpoint}`, requestOptions)
    }

    public async get(endpoint: string, searchParams?: URLSearchParams): Promise<unknown> {
        const method = 'GET';
        const elapsedTime = (Date.now() - this._accessTokenTimestamp) / (1000 * 60);
        if (elapsedTime > 20) {
            this._accessToken = await this.getAccessToken();
        }

        // TODO: figure out the right type
        const requestOptions = {
            method,
            headers: this.generateDefaultHeaders(method),
        }
        const baseUrl = `${this._amadeusBaseUrl}${endpoint}`;
        const url = searchParams ? `${baseUrl}?${searchParams}` : baseUrl;
        return fetch(url, requestOptions)
    }

    private generateDefaultHeaders(method: HTTPMethod): HeadersInit {
        let headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this._accessToken}`
        };

        if (method === 'POST') {
            headers['X-HTTP-Method-Override'] = 'POST' 
        }

        return headers;
    }
    private async getAccessToken(): Promise<string> {

        // TODO: move these secret values to a secrets manager
        const tokenRequest = {
            grant_type: 'client_credentials',
            client_id: process.env.client_id!,
            client_secret: process.env.client_secret!,
        };

        // TODO: figure out the right type
        const requestOptions: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(tokenRequest).toString(),
        };
        const tokenResponse = await fetch(`${this._amadeusBaseUrl}/v1/security/oauth2/token`, requestOptions);
        const responseBody: AccessTokenResponse = await tokenResponse.json() as AccessTokenResponse;
        this._accessTokenTimestamp = Date.now();
        return responseBody.access_token;
    }
}