import streamDeck, { LogLevel } from "@elgato/streamdeck";
import { IncrementCounter } from "./actions/increment-counter";
import { ViewersAction } from "./actions/viewers";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel(LogLevel.TRACE);

streamDeck.actions.registerAction(new IncrementCounter());
streamDeck.actions.registerAction(new ViewersAction());
streamDeck.connect();