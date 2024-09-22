import streamDeck, { LogLevel } from "@elgato/streamdeck";
import { ViewersAction } from "./actions/viewers";

streamDeck.logger.setLevel(LogLevel.ERROR);
streamDeck.actions.registerAction(new ViewersAction());
streamDeck.connect();