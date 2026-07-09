import { register, deregister } from "../register/register";
import type { App } from "@slack/bolt";
import { MARKER } from "../marker/marker";

export type CommandContext = {
    channel: string;
    threadTs: string;
    senderId: string;
    say: (message: any) => Promise<any>;
};

// !hello
export async function helloCommand(app:App, context:CommandContext) {
    app.client.chat.postMessage({
        channel: context.channel,
        thread_ts: context.threadTs,
        text: MARKER + ':miau2: Hi I\'m doppler. Nice to meet you!',
    });
}

// !register
export async function registerCommand(app: App, ctx: CommandContext) {
    let result = await register(ctx.senderId);
    app.client.chat.postMessage({
        channel: ctx.channel,
        thread_ts: ctx.threadTs,
        text: result
    });
}

// !deregister
export async function deregisterCommand(app: App, ctx: CommandContext) {
    let result = await deregister(ctx.senderId);
    app.client.chat.postMessage({
        channel: ctx.channel,
        thread_ts: ctx.threadTs,
        text: result
    });
}
