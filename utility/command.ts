import { register, deregister, setUserReminder, isRegistered, getUsername } from "../users/users";
import { formatSlackTimestamp } from "../utility/util";
import type { App } from "@slack/bolt";
import type { WebClient } from "@slack/web-api";
import * as chrono from "chrono-node";
import { getRandomEmote } from "./emote";

const DATE_CUTOFF = new Date("2000-01-01");

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
    ctx.args = args.slice(1);
    switch (command) {
        case 'mew':
            await mewCommand(ctx);
            break;
        case 'uwu':
            await uwuCommand(ctx);
            break;
        case 'miau':
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
        case 'emote':
            await emoteCommand(ctx);
            break;
        default:
            if (!isRegistered(ctx.senderId)) { return; }
            respondWith(ctx, `That's not a response, silly! ${await getRandomEmote(['happy'])} Did you need some \`!help\`?\n` +
                `if you recieved this and you don't know what this is, dm <@${process.env.ME_ID}> and let him know to fix the bug.`

            );
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
        text: message,
    });
}

// !hello
export async function helloCommand(context:CommandContext) {
    respondWith(context, `${await getRandomEmote(['meow'])} Hi I\'m Pixel Saver\'s alter ego. Nice to meet you!`);
}

// !register
export async function registerCommand(ctx: CommandContext) {
    const username = await getUsername(ctx.senderId, ctx.user_client);
    let result = await register(username ?? "", ctx.senderId);
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
        respondWith(ctx, `${await getRandomEmote(['meow'])} I couldn\'t parse the date. Please provide a valid date.`);
        return;
    }
    if (date.getTime() < DATE_CUTOFF.getTime()) {
        respondWith(ctx, `${await getRandomEmote(['meow'])} The date you provided is too far in the past. Don\'t be such an unc and choose a time when you were alive.`);
        return;
    }

    let result = await setUserReminder(ctx.senderId, { date: date.toISOString(), message: messageText });
    if (!result) {
        respondWith(ctx, `${await getRandomEmote(['meow'])} There has been an error reading your user. Try \`!deregister\` and then \`!register\`, or dm the maker.`);
        return;
    }
    
    respondWith(ctx,
        `${await getRandomEmote(['meow'])} I'll remind you ${formatSlackTimestamp(Math.floor(date.getTime() / 1000).toString(), date.toLocaleString())} 
        `)
        // (aka ${timeText.substring(12)}) to \'${messageText}\'
    
    
}
export async function helpCommand(ctx: CommandContext) {
    respondWith(ctx, `Available commands: ${await getRandomEmote(['regular'])}` + 
        `!register - Register yourself for using this bot` + 
        `!deregister - Deregister yourself from using this bot` + 
        `!remindme - Set a reminder (\`!remindme in <time> to <reminder text>\`)` + 
        `!meow - Bot meows for you (why?)` + 
        `!help - Show this help message` + 
        `` + 
        `> There's a hidden command that does something weird, so good luck finding it! ` + 
        `> (don't check the source code :pls:)
        `);
}
export async function meowCommand(ctx: CommandContext) {
    respondWith(ctx, await getRandomEmote(['meow']));
}
export async function uwuCommand(ctx: CommandContext) {
    var uwu = 'uwu'
    if (Math.random() < 0.05) { uwu = 'owo'}
    respondWith(ctx, `Yay you found the command! ${await getRandomEmote(['happy'])}\n${uwu} ${await getUsername(ctx.senderId, ctx.user_client)}`);
}
export async function mewCommand(ctx: CommandContext) {
    respondWith(ctx, `:mew: -- but I'm sure you meant \`!meow\`, right?? ${await getRandomEmote(['scared'])}`);
}
export async function emoteCommand(ctx: CommandContext) {
    var out = "";
    for (const tag of ctx.args) {
        out += await getRandomEmote([tag]);
    }
    respondWith(ctx, `${out}`);
}
