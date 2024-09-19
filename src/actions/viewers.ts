import streamDeck, { action, SingletonAction } from "@elgato/streamdeck";
import { TwtichClient } from "../api/twitch-client";
import type { Action, DidReceiveSettingsEvent, KeyDownEvent, PropertyInspectorDidAppearEvent, WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";
import { FetchClientResponse } from "../api/fetch-client";
import { TwitchResponse, TwitchStreamData } from "../api/types";

@action({ UUID: "ru.chimildic.multiviewers.viewers" })
export class ViewersAction extends SingletonAction<ViewersSettings> {

    private twitchClient: TwtichClient | undefined
    private lastTwitchViewerCount = 0

    private action: Action | undefined
    private settings: ViewersSettings | undefined
    private intervalId: NodeJS.Timeout | undefined

    onWillAppear(ev: WillAppearEvent<ViewersSettings>): Promise<void> | void {
        this.action = ev.action
        this.settings = ev.payload.settings
        this.twitchClient = new TwtichClient()
        this.intervalId = setInterval(this.updateViewerCount.bind(this), 60000)
        this.updateViewerCount()
    }

    onWillDisappear(ev: WillDisappearEvent<ViewersSettings>): Promise<void> | void {
        this.action = ev.action
        this.settings = ev.payload.settings
        clearInterval(this.intervalId)
    }

    onDidReceiveSettings(ev: DidReceiveSettingsEvent<ViewersSettings>): Promise<void> | void {
        this.action = ev.action
        this.settings = ev.payload.settings
        this.renderKeyIcon()
    }

    async onKeyDown(ev: KeyDownEvent<ViewersSettings>): Promise<void> {
        this.action = ev.action
        this.settings = ev.payload.settings
        this.updateViewerCount()
    }

    updateViewerCount() {
        let twitchChannelName = this.settings?.twitchChannelName
        if (twitchChannelName && twitchChannelName.length > 0) {
            this.twitchClient?.getStreams(twitchChannelName).then(this.onStreamsReceived.bind(this))
        } else {
            this.action?.setTitle("offline")
        }
    }

    onStreamsReceived(r: FetchClientResponse<TwitchResponse<TwitchStreamData[]>>) {
        if (r.body.data.length) {
            streamDeck.logger.info(`==========${JSON.stringify(r.body.data[0].viewer_count)}`)
            this.lastTwitchViewerCount = r.body.data[0].viewer_count
        } else {
            this.lastTwitchViewerCount = -1
        }
        this.renderKeyIcon()
    }

    renderKeyIcon() {
        let svg = this.createSvg()
        let escapedSvg = svg.replace(/"/g, `\"`)
        this.action!.setImage(escapedSvg)
    }

    createSvg(): string {
        return `data:image/svg+xml;charset=utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 288 288"><g class="layer"><rect fill="${this.settings?.backgroundColor || '#ffffff'}" height="288" id="svg_5" width="288" x="0" y="0"/><g fill="${this.settings?.twitchIconColor || '#a970ff'}"><path d="M29.9 28.8 12.4 46.3v63h21v17.5l17.5-17.5h14l31.5-31.5v-49H29.9zm59.5 45.5-14 14h-14l-12.25 12.25V88.3H33.4V35.8h56v38.5z"/><path d="M78.9 48.05h-7v21h7v-21zm-19.25 0h-7v21h7v-21z"/></g><text xml:space="preserve" x="191" y="95" fill="${this.settings?.twitchTextColor || '#a970ff'}" stroke-width="0" font-family="Roboto" font-size="62" text-anchor="middle">${this.lastTwitchViewerCount}</text></g></svg>`
    }
}

type ViewersSettings = {
    backgroundColor?: string;

    twitchTextColor?: string;
    twitchIconColor?: string;
    twitchChannelName?: string;

    vkPlayLiveChannelName?: string;
}