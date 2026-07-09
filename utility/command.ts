import { register, deregister, setUserReminder, isRegistered } from "../users/users";
import { formatSlackTimestamp } from "../utility/util";
import type { App } from "@slack/bolt";
import type { WebClient } from "@slack/web-api";
import { MARKER } from "../marker/marker";
import * as chrono from "chrono-node";

export type CommandContext = {
    app: App;
    user_client: WebClient;
    channel: string;
    threadTs: string;
    senderId: string;
    say: (message: any) => Promise<any>;
    args: string[];
};

export async function parseCommands(text: string, ctx: CommandContext) {
    // Commands start with !
    if (!text.startsWith('!')) return;
    text = text.substring(1);
    const args: string[] = text.split(' ');
    if (!args) return;
    const command = args.at(0);
    console.log("Command is", command);
    ctx.args = args
    switch (command) {
        case 'uwu':
            await uwuCommand(ctx);
            break;
        case 'meow':
            await meowCommand(ctx);
            break;
        case 'help':
            await helpCommand(ctx);
            break;
        case 'register':
            await registerCommand(ctx);
            break;
        case 'deregister':
            await deregisterCommand(ctx);
            break;
    }
    if (!isRegistered(ctx.senderId)) { return; }
    switch (command) {
        case 'hello':
            await helloCommand(ctx);
            break;
        case 'remindme':
            await remindmeCommand(ctx);
            break;
    }
}

export async function respondWith(ctx: CommandContext, message: string) {
    ctx.user_client.chat.postMessage({
        channel: ctx.channel,
        thread_ts: ctx.threadTs,
        text: MARKER + message,
    });
}

// !hello
export async function helloCommand(context:CommandContext) {
    respondWith(context, ':miau2: Hi I\'m Pixel Saver\'s alter ego. Nice to meet you!');
}

// !register
export async function registerCommand(ctx: CommandContext) {
    const res = await ctx.user_client.users.info({
      user: ctx.senderId,
    });
    let result = await register(res.user?.name ?? "", res.user?.id ?? ctx.senderId);
    respondWith(ctx, result);
}

// !deregister
export async function deregisterCommand(ctx: CommandContext) {
    let result = await deregister(ctx.senderId);
    respondWith(ctx, result);
}

// !remindme
export async function remindmeCommand(ctx: CommandContext) {
    let input = ctx.args.join(" ");
    let parts = input.split(" to ");
    const [timeText, messageText] = parts;
    if (!timeText || !messageText) { return; }
    const date = chrono.parseDate(timeText);
    if (!date) {
        respondWith(ctx, ':miau2: I couldn\'t parse the date. Please provide a valid date.');
        return;
    }

    let result = await setUserReminder(ctx.senderId, { date: date.toISOString(), message: messageText });
    if (!result) {
        respondWith(ctx, ':miau2: There has been an error reading your user. Try `!deregister` and then `!register`, or dm the maker.');
        return;
    }
    
    respondWith(ctx, `I'll remind you ${formatSlackTimestamp(Math.floor(date.getTime()/1000).toString(), date.toLocaleString())} (aka ${timeText.substring(12)}) to \'${messageText}\'`)
    
    
}
export async function helpCommand(ctx: CommandContext) {
    respondWith(ctx, `Available commands:\n
        !register - Register yourself for using this bot\n
        !deregister - Deregister yourself from using this bot\n
        !remindme - Set a reminder (\`!remindme in <time> to <reminder text>\`)\n
        !meow - Bot meows for you (why?)\n
        !help - Show this help message
        > There's a hidden command that does something weird, so good luck finding it! (don't check the source code :pls:)
        `);
}
export async function meowCommand(ctx: CommandContext) {
    const randomMeow = Math.random() < 0.5 ? ':miau:' : ':miau2:';
    respondWith(ctx, randomMeow);
}
export async function uwuCommand(ctx: CommandContext) {
    respondWith(ctx, 'uwu');
}