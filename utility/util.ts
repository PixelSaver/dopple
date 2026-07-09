import { App } from "@slack/bolt";
import type { CommandContext } from "../utility/command";

export async function getMessagePermalink(ctx: CommandContext): Promise<string> {
    const { user_client, channel, threadTs } = ctx;
    const result = await user_client.chat.getPermalink({
        channel: channel,
        message_ts: threadTs,
    });
    return result.permalink ?? "";
}
export function formatSlackTimestamp(timestamp: string, fallback_text: string): string {
    return `<!date^${timestamp}^{date_long_pretty} at {time_secs}, or {ago}|${fallback_text}>`
}

export async function respondWith(ctx: CommandContext, message: string) {
    ctx.user_client.chat.postMessage({
        channel: ctx.channel,
        thread_ts: ctx.threadTs,
        text: message,
    });
}