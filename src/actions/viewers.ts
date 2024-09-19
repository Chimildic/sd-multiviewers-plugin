import { action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";

@action({ UUID: "ru.chimildic.multiviewers.viewers" })
export class ViewersAction extends SingletonAction<ViewersSettings> {

    onWillAppear(ev: WillAppearEvent<ViewersSettings>): void | Promise<void> {
        
    }

    async onKeyDown(ev: KeyDownEvent<ViewersSettings>): Promise<void> {

    }
}

/**
 * Settings for {@link ViewersAction}.
 */
type ViewersSettings = {
    twitchChannelName?: string;
    vkPlayLiveChannelName?: string;
};
