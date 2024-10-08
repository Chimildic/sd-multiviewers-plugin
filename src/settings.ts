import streamDeck from "@elgato/streamdeck";
import { GlobalSettings } from "./types";
import { Credentials } from "./api/types";

export async function getSetting(key: keyof GlobalSettings): Promise<Credentials | undefined> {
    let globalSettings = await streamDeck.settings.getGlobalSettings<GlobalSettings>()
    return globalSettings[key]
}

export async function setSetting(key: keyof GlobalSettings, value: any): Promise<void> {
    let globalSettings = await streamDeck.settings.getGlobalSettings<GlobalSettings>()
    globalSettings[key] = value
    return streamDeck.settings.setGlobalSettings(globalSettings)
}