import { App } from "@slack/bolt";
import { MARKER } from "../marker/marker";
import type { CommandContext } from "./command";

export async function helloCommand(app:App, context:CommandContext) {
    app.client.chat.postMessage({
        channel: context.channel,
        thread_ts: context.threadTs,
        text: MARKER + ':miau2: Hi I\'m doppler. Nice to meet you!',
    });
}