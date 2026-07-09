import { register, deregister, isRegistered, getUsername } from "../functionality/users";
import type { App } from "@slack/bolt";
import type { WebClient } from "@slack/web-api";
import { respondWith } from "../utility/util";
import { remindmeCommand } from "../functionality/reminder";
import { getRandomEmote } from "./emote";


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
            return helloCommand(ctx);

        // Registered only
        case 'remindme':
            return remindmeCommand(ctx);
        
        default:
            return respondWith(
                ctx,
                `That's not a response, silly! ${await getRandomEmote(['happy'])} Did you need some \`!help\`?\n` +
                `If you received this and don't know what it is, DM <@${process.env.ME_ID}> and let him know to fix the bug.`
            );
    }
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


export async function helpCommand(ctx: CommandContext) {
    respondWith(ctx, `Available commands: ${await getRandomEmote(['regular'])}\n` + 
        `- !meow - Bot meows for you (why?)\n` + 
        `- !emote - Get a random emote (e.g. \`!emote happy\`)\n` + 
        `- !help - Show this help message\n` + 
        `- !register - Register yourself for using this bot\n` + 
        `- !deregister - Deregister yourself from using this bot\n` + 
        `- !remindme - Set a reminder (\`!remindme <time (tomorrow, in three days, etc.)> to <reminder text>\`)` +
        `btw try different grammars and see if it works!(for, of, about, that, etc.) DM < @${ process.env.ME_ID }> if it doesn't so they can fix it.\n` + 
        `` + 
        `*Registration does nothing right now... :P` + 
        `` + 
        `> There's a hidden command that does something weird, so good luck finding it!\n` + 
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
