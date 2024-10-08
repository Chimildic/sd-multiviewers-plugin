import { FetchClient } from "./fetch-client"
import { getSetting, setSetting } from "../settings"
import { appendExperedAt, serialize } from "./common"
import type { Credentials, TwitchResponse, TwitchStreamData, FetchClientResponse, AuthRequest } from "./types"

export class TwtichClient {

    private authClient: FetchClient
    private apiClient: FetchClient
    private credentials: Credentials | undefined

    static readonly port = 26741
    private static readonly clientId = ''
    private static readonly clientSecret = ''
    private static readonly redirectUrl = `http://localhost:${TwtichClient.port}/twitch`
    static readonly authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${TwtichClient.clientId}&response_type=code&force_verify=true&redirect_uri=${TwtichClient.redirectUrl}`

    constructor() {
        this.authClient = new FetchClient({
            baseUrl: 'https://id.twitch.tv/oauth2',
            responseType: 'json'
        })

        this.apiClient = new FetchClient({
            baseUrl: 'https://api.twitch.tv/helix',
            responseType: 'json',
            transformRequest: [this.transformRequest.bind(this)],
        })
    }

    async getStreams(user_login: string | string[]): Promise<FetchClientResponse<TwitchResponse<TwitchStreamData[]>>> {
        let query = Array.isArray(user_login)
            ? user_login.map(u => `user_login=${u}`).join('&')
            : `user_login=${user_login}`
        let path = `/streams?${query}`
        return this.apiClient.get<TwitchResponse<TwitchStreamData[]>>(path)
    }

    async onCodeReceived(code: string | undefined) {
        if (code != undefined) {
            let response = await this.exchangeCode(code)
            setSetting('twitchCredentials', response?.body)
        }
    }

    private async exchangeCode(code: string): Promise<FetchClientResponse<Credentials>> {
        return this.postToTokenEndpoint({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: TwtichClient.redirectUrl
        })
    }

    private async refreshToken(refresh_token: string): Promise<FetchClientResponse<Credentials>> {
        return this.postToTokenEndpoint({
            grant_type: 'refresh_token',
            refresh_token: refresh_token,
        })
    }

    private async fetchCredentials(): Promise<FetchClientResponse<Credentials>> {
        return this.postToTokenEndpoint({
            grant_type: 'client_credentials'
        })
    }

    private postToTokenEndpoint(body: AuthRequest): Promise<FetchClientResponse<Credentials>> {
        body.client_id = TwtichClient.clientId
        body.client_secret = TwtichClient.clientSecret
        return this.authClient.post<Credentials>('/token', serialize(body), {
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            }
        }).then(appendExperedAt)
    }

    private async transformRequest(url: string, options: RequestInit): Promise<RequestInit> {
        if (this.credentials == undefined) {
            this.credentials = await getSetting('twitchCredentials')
        }
        if (this.credentials == undefined || this.credentials!.expered_at_ms - Date.now() < 3600000) {
            this.credentials = (await this.fetchCredentials()).body
            setSetting('twitchCredentials', this.credentials)
        }
        options.headers = {
            'client-id': TwtichClient.clientId,
            'authorization': 'Bearer ' + this.credentials!.access_token,
        }
        return options
    }
}