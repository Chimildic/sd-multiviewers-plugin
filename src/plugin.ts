import streamDeck, { LogLevel } from "@elgato/streamdeck";
import { ViewersAction } from "./actions/viewers";

streamDeck.logger.setLevel(LogLevel.TRACE);
streamDeck.actions.registerAction(new ViewersAction());
streamDeck.connect();