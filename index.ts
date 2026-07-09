import { App } from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import { MARKER } from "./marker/marker";
import type { CommandContext } from "./utility/command";
import { isRegistered, checkReminders, loadUsers, getUserPester } from "./users/users";
import { helloCommand, registerCommand, deregisterCommand, remindmeCommand, helpCommand, meowCommand, respondWith } from "./utility/command";
import { getRandomEmote } from "./utility/emote";

async function parseCommands(app: App, client: WebClient, text: string, ctx: CommandContext) {
    // Commands start with !
    if (!text.startsWith('!')) return;
    text = text.substring(1);
    const args: string[] = text.split(' ');
    if (!args) return;
    const command = args.at(0);
    console.log("Command is", command);
    ctx.args = args
    switch (command) {
        case 'meow':
            await meowCommand(client, ctx);
            break;
        case 'help':
            await helpCommand(client, ctx);
            break;
        case 'register':
            await registerCommand(client, ctx);
            break;
        case 'deregister':
            await deregisterCommand(client, ctx);
            break;
    }
    if (!isRegistered(ctx.senderId)) { return; }
    switch (command) {
        case 'hello':
            await helloCommand(client, ctx);
            break;
        case 'remindme':
            await remindmeCommand(client, ctx);
            break;
    }
}

const app = new App({
    token: process.env.SLACK_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,
    socketMode: true,
});
const client = new WebClient(process.env.SLACK_USER_TOKEN);


app.message(async (event) => {
    // Make sure its a message
    if (event.payload.subtype) return;
    // Make sure it's not self responding
    if (event.payload.text?.startsWith(MARKER)) { return; }
    
    parseCommands(app, client, event.payload.text ?? "", {
        channel: event.payload.channel,
        threadTs: event.payload.thread_ts ?? event.payload.ts,
        senderId: event.payload.user,
        say: event.say,
        args: [],
    })
    
    // Make sure they opted in
    var registered = await isRegistered(event.payload.user);
    if (!registered) { return; };
    const pester = await getUserPester(event.payload.user);
    
    if (pester) {
        console.log("Pestering")
        
        if (Math.random() < .3) {
            respondWith(
                client,
                {
                    channel: event.payload.channel,
                    threadTs: event.payload.thread_ts ?? event.payload.ts,
                    senderId: event.payload.user,
                    say: event.say,
                    args: []
                },
                `${await getRandomEmote()} <@${event.payload.user}> ${await getRandomEmote()}` )
        }
        if (Math.random() < .3) {
            respondWith(
                app.client,
                {
                    channel: event.payload.channel,
                    threadTs: event.payload.thread_ts ?? event.payload.ts,
                    senderId: event.payload.user,
                    say: event.say,
                    args: []
                },
                `${await getRandomEmote()} <@${event.payload.user}> ${await getRandomEmote()}` )
        }
    }
    
    var message = event.payload.text ?? "";
    console.log(message);
    if (event.payload.channel !== process.env.ALLOWED_DM_CHANNEL) { return;  }
    // var message = event.payload.text;
    // if (message) {
    //     console.log(message);
    // };

    await client.chat.postMessage({
        channel: event.payload.channel,
        thread_ts: event.payload.thread_ts ?? event.payload.ts,
        text: MARKER + ':miau2:',
    });
    
    // event.say(':miau2: <@' + process.env.ID + '> :miau:');
    // await client.chat.postMessage({
    //     channel: event.payload.channel,
    //     thread_ts: event.payload.thread_ts,
    //     text: ':miau2: <@' + process.env.ME_ID + '> :miau:',
    // });
})

await app.start();
setInterval(() => {
    checkReminders(app.client)
}, 10_000);
