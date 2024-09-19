import { FetchClient } from "./fetch-client"
import { getSetting, setSetting } from "../settings"
import type { ClientCredentials, TwitchResponse, TwitchStreamData, FetchClientResponse } from "./types"
import streamDeck from "@elgato/streamdeck"

export class TwtichClient {

    private authClient: FetchClient
    private apiClient: FetchClient

    private readonly clientId = '***REMOVED***'
    private readonly clientSecret = '***REMOVED***'
    private credentials: ClientCredentials | undefined

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

    private async fetchCredentials(): Promise<FetchClientResponse<ClientCredentials>> {
        let body = `client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=client_credentials`
        let response = this.authClient.post<ClientCredentials>('/token', body, {
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            }
        }).then(response => {
            response.body.expered_at_ms = Date.now() + (response.body.expires_in * 1000)
            return response
        })
        return response
    }

    private async transformRequest(url: string, options: RequestInit): Promise<RequestInit> {
        if (this.credentials == undefined) {
            this.credentials = await getSetting('twitchCredentials')
        }
        if (this.credentials == undefined || this.credentials.expered_at_ms - Date.now() < 3600000) {
            this.credentials = (await this.fetchCredentials()).body
            setSetting('twitchCredentials', this.credentials)
        }
        options.headers = {
            'client-id': this.clientId,
            'authorization': 'Bearer ' + this.credentials!.access_token,
            'cache-control': 'no-cache'
        }
        return options
    }
}