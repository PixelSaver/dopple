import type { CommandContext } from "../utility/command";
import { WebClient } from "@slack/web-api";
import { respondWith, formatSlackTimestamp } from "../utility/util";
import * as chrono from "chrono-node";
import { getRandomEmote } from "../utility/emote";
import { getMessagePermalink } from "../utility/util";
import { loadUsers, saveUsers, isRegistered, register, getUsername } from "../functionality/users";

export interface Reminder {
    date: string;
    message: string;
}

const DATE_CUTOFF = new Date("2000-01-01");

// !remindme
export async function remindmeCommand(ctx: CommandContext) {
    if (! await isRegistered(ctx.senderId)) {
        await registerSilently(ctx);
    }
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
        `My sources are telling me you asked me to remind you of this:\n\n` +
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
export async function registerSilently(ctx: CommandContext) {
    const username = await getUsername(ctx.senderId, ctx.user_client);
    console.log("Silently registering user:", username);
    let result = await register(username ?? "", ctx.senderId);
}

export async function setUserReminder(user_id: string, reminder: Reminder) {
    const users = await loadUsers();
    const user = users.find((u) => u.id === user_id);
    if (!user || !user.reminders) {
        return false;
    }
    user.reminders.push(reminder);

    await saveUsers(users);
    return true;
}
export async function consumeUserReminder(user_id: string, date: string) {
    const users = await loadUsers();
    const user = users.find((u) => u.id === user_id);
    if (!user || !user.reminders) {
        return false;
    }
    user.reminders = user.reminders.filter((r) => r.date !== date);
    await saveUsers(users);
    return true;
}

export async function checkReminders(client: WebClient) {
    // console.log("checking reminders");
    const now = new Date();
    const users = await loadUsers();
    for (const user of users) {
        for (const reminder of user.reminders ?? []) {
            if (new Date(reminder.date) <= now) {
                const dm = await client.conversations.open({ users: user.id });
                if (!dm.channel?.id) return;
                await client.chat.postMessage({
                    channel: dm.channel.id,
                    text: reminder.message,
                });
                await consumeUserReminder(user.id, reminder.date);
            }
        }
    }
}