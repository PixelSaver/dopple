import { register, deregister, setUserReminder } from "../register/register";
import type { App } from "@slack/bolt";
import { MARKER } from "../marker/marker";
import * as chrono from "chrono-node";

export type CommandContext = {
    channel: string;
    threadTs: string;
    senderId: string;
    say: (message: any) => Promise<any>;
    args: string[];
};

export async function respondWith(app: App, ctx: CommandContext, message: string) {
    app.client.chat.postMessage({
        channel: ctx.channel,
        thread_ts: ctx.threadTs,
        text: MARKER + message,
    });
}

// !hello
export async function helloCommand(app:App, context:CommandContext) {
    respondWith(app, context, ':miau2: Hi I\'m doppler. Nice to meet you!');
}

// !register
export async function registerCommand(app: App, ctx: CommandContext) {
    let result = await register(ctx.senderId);
    respondWith(app, ctx, result);
}

// !deregister
export async function deregisterCommand(app: App, ctx: CommandContext) {
    let result = await deregister(ctx.senderId);
    respondWith(app, ctx, result);
}

// !remindme
export async function remindmeCommand(app: App, ctx: CommandContext) {
    let input = ctx.args.join(" ");
    let parts = input.split(" to ");
    const [timeText, messageText] = parts;
    if (!timeText || !messageText) { return; }
    const date = chrono.parseDate(timeText);
    if (!date) {
        respondWith(app, ctx, ':miau2: I couldn\'t parse the date. Please provide a valid date.');
        return;
    }

    let result = await setUserReminder(ctx.senderId, { date: date.toISOString(), message: messageText });
    if (!result) {
        respondWith(app, ctx, ':miau2: There has been an error reading your user. Try `!deregister` and then `!register`, or dm the maker.');
        return;
    }
    
    respondWith(app, ctx, `I'll remind you on ${date.toLocaleString()} to ${messageText}`)
    
    
}