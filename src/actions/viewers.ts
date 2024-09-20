import streamDeck, { action, SingletonAction } from "@elgato/streamdeck";
import { TwtichClient } from "../api/twitch-client";
import { VPLClient } from "../api/vpl-client";
// import { listenCode } from "../api/local-server";
import type { TwitchResponse, TwitchStreamData, FetchClientResponse, VPLResonse, VPLChannelData } from "../api/types";
import type { Action, DidReceiveSettingsEvent, KeyDownEvent, WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";

@action({ UUID: "ru.chimildic.multiviewers.viewers" })
export class ViewersAction extends SingletonAction<ViewersSettings> {

    private twitchClient = new TwtichClient()
    private vplClient = new VPLClient()
    private lastTwitchViewerCount = 0
    private lastVPLViewerCount = 0

    private action: Action | undefined
    private settings: ViewersSettings | undefined
    private intervalId: NodeJS.Timeout | undefined

    private static defaultSettings = {
        backgroundColor: '#000000',
        twitchTextColor: '#a970ff',
        twitchIconColor: '#a970ff',
        twitchChannelName: undefined,
        vplTextColor: '#0077ff',
        vplIconColor: '#0077ff',
        vplChannelName: undefined,
    }

    // onSendToPlugin(ev: SendToPluginEvent<object, ViewersSettings>): Promise<void> | void {
    //     if (ev.payload.platform == 'twitch') {
    //         listenCode(TwtichClient.port, this.twitchClient.onCodeReceived.bind(this.twitchClient))
    //         streamDeck.system.openUrl(TwtichClient.authUrl)
    //     }
    // }

    onWillAppear(ev: WillAppearEvent<ViewersSettings>): Promise<void> | void {
        this.action = ev.action
        this.settings = ev.payload.settings
        if (Object.keys(this.settings).length == 0) {
            this.action?.setSettings(ViewersAction.defaultSettings)
        }
        this.intervalId = setInterval(this.updateAndRender.bind(this), 120000)
        this.updateAndRender()
    }

    onWillDisappear(ev: WillDisappearEvent<ViewersSettings>): Promise<void> | void {
        this.action = ev.action
        this.settings = ev.payload.settings
        clearInterval(this.intervalId)
    }

    onDidReceiveSettings(ev: DidReceiveSettingsEvent<ViewersSettings>): Promise<void> | void {
        let isChannelNameChanged = this.settings?.twitchChannelName != ev.payload.settings.twitchChannelName
            || this.settings?.vplChannelName != ev.payload.settings.vplChannelName

        this.action = ev.action
        this.settings = ev.payload.settings

        if (isChannelNameChanged) {
            this.updateAndRender()
        } else {
            this.renderKeyIcon()
        }
    }

    async onKeyDown(ev: KeyDownEvent<ViewersSettings>): Promise<void> {
        // this.action = ev.action
        // this.settings = ev.payload.settings
        // this.updateAndRender()
    }

    async updateAndRender(): Promise<void> {
        await this.updateViewerCount()
        this.renderKeyIcon()
    }

    async updateViewerCount(): Promise<void> {
        let twitchChannelName = this.settings?.twitchChannelName
        if (twitchChannelName && twitchChannelName.length > 3) {
            this.lastTwitchViewerCount = await this.twitchClient?.getStreams(twitchChannelName)
                .then(r => r.body.data.length > 0 ? r.body.data[0].viewer_count : -1)
                .catch(r => (streamDeck.logger.error(r), -1))
        } else {
            this.lastTwitchViewerCount = -1
        }
        streamDeck.logger.info(`======twitch====${this.lastTwitchViewerCount}`)

        let vplChannelName = this.settings?.vplChannelName
        if (vplChannelName && vplChannelName.length > 3) {
            this.lastVPLViewerCount = await this.vplClient?.getChannel(vplChannelName)
                .then(r => {
                    let viewers = r.body.data.stream?.counters?.viewers
                    return viewers && viewers >= 0 ? viewers : -1
                })
                .catch(r => (streamDeck.logger.error(r), -1))
        } else {
            this.lastVPLViewerCount = -1
        }
        streamDeck.logger.info(`======vpl====${this.lastVPLViewerCount}`)
    }

    renderKeyIcon() {
        this.action!.setImage(this.createSvg())
    }

    createSvg(): string {
        if (this.lastTwitchViewerCount == -1 && this.lastVPLViewerCount == -1) {
            return `data:image/svg+xml;charset=utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 288 288"><path fill="#${this.settings?.backgroundColor}" d="M0 0h288v288H0z"/></svg>`
        }
        return `data:image/svg+xml;charset=utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 288 288"><g class="layer"><path fill="${this.settings?.backgroundColor || ViewersAction.defaultSettings.backgroundColor}" d="M0 0h288v288H0z"/><g fill="${this.settings?.twitchIconColor || ViewersAction.defaultSettings.twitchIconColor}"><path d="M39.3583081 40.6334272 25.3999756 54.5917597v50.249997h16.749999v13.9583325l13.9583325-13.9583325h11.166666l25.1249985-25.1249985v-39.083331H39.3583081zm47.4583305 36.2916645-11.166666 11.166666h-11.166666l-9.77083275 9.77083275V88.0917577H42.1499746V46.2167602h44.666664v30.7083315z"/><path d="M78.4416391 55.98759295h-5.583333v16.749999h5.583333v-16.749999zm-15.35416575 0h-5.583333v16.749999h5.583333v-16.749999z"/></g><text xml:space="preserve" x="191" y="97" fill="${this.settings?.twitchTextColor || ViewersAction.defaultSettings.twitchTextColor}" stroke-width="0" font-family="Roboto" font-size="62" text-anchor="middle">${this.friendlyNumber(this.lastTwitchViewerCount)}</text><use xlink:href="#a" transform="translate(20.9411 169.941) scale(.7319)"/><text xml:space="preserve" x="191" y="229" fill="${this.settings?.vplTextColor || ViewersAction.defaultSettings.vplTextColor}" stroke-width="0" font-family="Roboto" font-size="62" text-anchor="middle">${this.friendlyNumber(this.lastVPLViewerCount)}</text></g><defs><symbol xmlns="http://www.w3.org/2000/svg" id="a" width="104" height="104" preserveAspectRatio="xMidYMid meet" viewBox="0 0 78 78"><g fill="${this.settings?.vplIconColor || ViewersAction.defaultSettings.vplIconColor}"><path d="M180 771c-60-9-106-29-131-57-37-43-44-92-44-324 0-192 3-232 18-271C62 17 99 5 390 5c192 0 232 3 271 18 102 39 114 76 114 367 0 369-10 380-345 385-107 2-220 0-250-4zm430-298c57-52 56-129-1-177-92-78-220 35-164 144 32 62 114 78 165 33zm-390-8 24-25 28 27 28 27 27-27 27-27-27-28-27-28 25-24c31-29 31-41 0-70l-25-24-30 29-30 29-28-27-28-27-27 27-27 27 27 28 27 28-29 30-29 30 24 25c29 31 41 31 70 0z" transform="matrix(.1 0 0 -.1 0 78)"/><path d="M514 406c-11-28 1-51 25-51 32 0 49 28 32 49-17 20-50 21-57 2z" transform="matrix(.1 0 0 -.1 0 78)"/></g></symbol></defs></svg>`
    }

    friendlyNumber(value: number): string {
        if (value <= 99999) {
            return value.toString();
        } else if (value <= 999999) {
            return (value / 1000).toFixed(1) + 'K';
        } else {
            return (value / 1000000).toFixed(3) + 'M';
        }
    }
}

type ViewersSettings = {
    backgroundColor?: string;
    twitchTextColor?: string;
    twitchIconColor?: string;
    twitchChannelName?: string;
    vplTextColor?: string;
    vplIconColor?: string;
    vplChannelName?: string;
}