import { register, deregister, setUserReminder, isRegistered, getUsername } from "../users/users";
import { formatSlackTimestamp, getMessagePermalink } from "../utility/util";
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
        // Public commands
        case 'mew':
            return mewCommand(ctx);
        case 'uwu':
            return uwuCommand(ctx);
        case 'miau':
        case 'meow':
            return meowCommand(ctx);
        case 'help':
            return helpCommand(ctx);
        case 'register':
            return registerCommand(ctx);
        case 'deregister':
            return deregisterCommand(ctx);
        case 'emote':
            return emoteCommand(ctx);
        case 'hello':
            if (!isRegistered(ctx.senderId)) return;
            return helloCommand(ctx);

        // Registered only
        case 'remindme':
            if (!isRegistered(ctx.senderId)) return;
            return remindmeCommand(ctx);
        
        default:
            if (!isRegistered(ctx.senderId)) return;
        
            return respondWith(
                ctx,
                `That's not a response, silly! ${await getRandomEmote(['happy'])} Did you need some \`!help\`?\n` +
                `If you received this and don't know what it is, DM <@${process.env.ME_ID}> and let him know to fix the bug.`
            );
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
    const match = input.match(/^(.*?)\s+(to|about|that|of)\s+(.+)$/i);
    
    if (!match) {
        return;
    }
    
    const [, timeText, separator, messageText] = match;
    if (!timeText || !messageText) { return; }
    const date = chrono.parseDate(timeText);
    if (!date) {
        respondWith(ctx, `${await getRandomEmote(['mad'])} I couldn\'t parse the date. ${await getRandomEmote(['beg'])}Please provide a valid date.`);
        return;
    }
    if (date.getTime() < DATE_CUTOFF.getTime()) {
        respondWith(ctx, `${await getRandomEmote(['mad'])} The date you provided is too far in the past. Don\'t be such an unc and choose a time when you were alive.`);
        return;
    }
    let permalink = await getMessagePermalink(ctx)
    let message = `Hello! This is PixelSaver's alter ego speaking ${await getRandomEmote(['happy'])}\n` +
        `My sources are telling me you asked me to remind you of this:\n` +
        `> ${messageText}\n\n` + 
        `<` + `${permalink}|Jump to your original message>\n` +
        `Hope that helps! ${await getRandomEmote(['happy'])}`;
    let result = await setUserReminder(ctx.senderId, { date: date.toISOString(), message: message });
    if (!result) {
        respondWith(ctx, `${await getRandomEmote(['sad'])} There has been an error reading your user. ${await getRandomEmote(['scared'])} Try \`!deregister\` and then \`!register\`, or dm the maker.`);
        return;
    }

    var messageResponse = "when you should think about"
    switch (separator) {
        case "to":
            messageResponse = `that you need to`;
            break;
        case "about":
            messageResponse = `to think about`;
            break;
        case "that":
            messageResponse = `that`;
            break;
        case "of":
            messageResponse = `when you should think of`;
            break;
        default:
            messageResponse = messageText;
            break;
    }
    respondWith(ctx,
        `${await getRandomEmote(['meow', 'regular'])} I'll remind you ${formatSlackTimestamp(Math.floor(date.getTime() / 1000).toString(), date.toLocaleString())}` +
        ` ${messageResponse} \`${messageText}\``
    )
    
    
}
export async function helpCommand(ctx: CommandContext) {
    respondWith(ctx, `Available commands: ${await getRandomEmote(['regular'])}` + 
        `- !register - Register yourself for using this bot` + 
        `- !deregister - Deregister yourself from using this bot` + 
        `- !remindme - Set a reminder (\`!remindme <time (tomorrow, in three days, etc.)> to <reminder text>\`) btw try different grammars and see if it works! (for, of, about, that, etc.) DM <@${process.env.ME_ID}> if it doesn't so they can fix it.` + 
        `- !meow - Bot meows for you (why?)` + 
        `- !emote - Get a random emote (e.g. \`!emote happy\`)` + 
        `- !help - Show this help message` + 
        `` + 
        `> There's a hidden command that does something weird, so good luck finding it! ` + 
        `> (don't check the source code for this :pls:${await getRandomEmote(['scared'])})
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
    if (ctx.args.length === 0) {
        respondWith(ctx, `${await getRandomEmote(['regular'])}`);
        return;
    }
    var out = "";
    for (const tag of ctx.args) {
        out += await getRandomEmote([tag]);
    }
    respondWith(ctx, `${out}`);
}
