import { FetchClient  } from "./fetch-client"
import { getSetting, setSetting } from "../settings"
import { appendExperedAt, serialize } from "./common"
import type { Credentials, FetchClientResponse, VPLChannelData, VPLResonse } from "./types"
import streamDeck from "@elgato/streamdeck"

export class VPLClient {
    private authClient: FetchClient
    private apiClient: FetchClient
    private credentials: Credentials | undefined

    static readonly port = 26741
    private static readonly clientId = ''
    private static readonly clientSecret = ''
    private static readonly redirectUrl = `http://localhost:${VPLClient.port}/vkplaylive`
    static readonly authUrl = `https://auth.live.vkplay.ru/app/oauth2/authorize?client_id=${VPLClient.clientId}&response_type=code&redirect_uri=${VPLClient.redirectUrl}`

    constructor() {
        this.authClient = new FetchClient({
            baseUrl: '',
            responseType: 'json'
        })

        this.apiClient = new FetchClient({
            baseUrl: 'https://apidev.live.vkplay.ru/v1',
            responseType: 'json',
            transformRequest: [this.transformRequest.bind(this)],
        })
    }

    async getChannel(channel_url: string): Promise<FetchClientResponse<VPLResonse<VPLChannelData>>> {
        return this.apiClient.get<VPLResonse<VPLChannelData>>(`/channel?channel_url=${channel_url}`)
    }


    private async fetchCredentials(): Promise<FetchClientResponse<Credentials>> {
        let body = serialize({ grant_type: 'client_credentials' })
        return this.authClient.post<Credentials>('https://api.live.vkplay.ru/oauth/server/token', body, {
            headers: {
                'authorization': 'Basic <base64encoded_credeantials>',
                'content-type': 'application/x-www-form-urlencoded'
            }
        }).then(appendExperedAt).catch(e => (streamDeck.logger.error(e), e))
    }

    private async transformRequest(url: string, options: RequestInit): Promise<RequestInit> {
        if (this.credentials == undefined) {
            this.credentials = await getSetting('vplCredentials')
        }
        if (this.credentials == undefined || this.credentials!.expered_at_ms - Date.now() < 3600000) {
            this.credentials = (await this.fetchCredentials()).body
            setSetting('vplCredentials', this.credentials)
        }
        options.headers = {
            'authorization': 'Bearer ' + this.credentials!.access_token,
        }
        return options
    }
}