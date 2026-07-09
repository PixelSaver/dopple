import { register, deregister, setUserReminder } from "../users/users";
import type { App } from "@slack/bolt";
import type { WebClient } from "@slack/web-api";
import { MARKER } from "../marker/marker";
import * as chrono from "chrono-node";

export type CommandContext = {
    channel: string;
    threadTs: string;
    senderId: string;
    say: (message: any) => Promise<any>;
    args: string[];
};

export async function respondWith(client: WebClient, ctx: CommandContext, message: string) {
    client.chat.postMessage({
        channel: ctx.channel,
        thread_ts: ctx.threadTs,
        text: MARKER + message,
    });
}

// !hello
export async function helloCommand(client: WebClient, context:CommandContext) {
    respondWith(client, context, ':miau2: Hi I\'m Pixel Saver\'s alter ego. Nice to meet you!');
}

// !register
export async function registerCommand(client: WebClient, ctx: CommandContext) {
    const res = await client.users.info({
      user: ctx.senderId,
    });
    let result = await register(res.user?.name ?? "", res.user?.id ?? ctx.senderId);
    respondWith(client, ctx, result);
}

// !deregister
export async function deregisterCommand(client: WebClient, ctx: CommandContext) {
    let result = await deregister(ctx.senderId);
    respondWith(client, ctx, result);
}

// !remindme
export async function remindmeCommand(client: WebClient, ctx: CommandContext) {
    let input = ctx.args.join(" ");
    let parts = input.split(" to ");
    const [timeText, messageText] = parts;
    if (!timeText || !messageText) { return; }
    const date = chrono.parseDate(timeText);
    if (!date) {
        respondWith(client, ctx, ':miau2: I couldn\'t parse the date. Please provide a valid date.');
        return;
    }

    let result = await setUserReminder(ctx.senderId, { date: date.toISOString(), message: messageText });
    if (!result) {
        respondWith(client, ctx, ':miau2: There has been an error reading your user. Try `!deregister` and then `!register`, or dm the maker.');
        return;
    }
    
    respondWith(client, ctx, `I'll remind you on ${date.toLocaleTimeString()} (aka ${timeText.substring(11)}) to \'${messageText}\'`)
    
    
}
export async function helpCommand(client: WebClient, ctx: CommandContext) {
    respondWith(client, ctx, `Available commands:\n
        !register - Register yourself for using this bot\n
        !deregister - Deregister yourself from using this bot\n
        !remindme - Set a reminder (\`!remindme in <time> to <reminder text>\`)\n
        !meow - Bot meows for you (why?)\n
        !help - Show this help message
        > There's a hidden command that does something weird, so good luck finding it! (don't check the source code :pls:)
        `);
}
export async function meowCommand(client: WebClient, ctx: CommandContext) {
    const randomMeow = Math.random() < 0.5 ? ':miau:' : ':miau2:';
    respondWith(client, ctx, randomMeow);
}