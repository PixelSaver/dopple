import { App } from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import { isRegistered, loadUsers, getUserPester } from "./functionality/users";
import { respondWith } from './utility/util';
import { checkReminders } from './functionality/reminder';
import { parseCommands } from "./utility/command";
import { getRandomEmote } from "./utility/emote";


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
    if (event.payload.bot_id) { return; }
    
    parseCommands(event.payload.text ?? "", {
        app,
        user_client: client,
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
            await respondWith(
                {
                    app,
                    user_client: client,
                    channel: event.payload.channel,
                    threadTs: event.payload.thread_ts ?? event.payload.ts,
                    senderId: event.payload.user,
                    say: event.say,
                    args: []
                },
                `${await getRandomEmote([])} <@${event.payload.user}> ${await getRandomEmote([])}` )
        }
    }
    
    if (event.payload.channel !== process.env.ALLOWED_DM_CHANNEL) { return;  }
    // var message = event.payload.text;
    // if (message) {
    //     console.log(message);
    // };

    await client.chat.postMessage({
        channel: event.payload.channel,
        thread_ts: event.payload.thread_ts ?? event.payload.ts,
        text: ':miau2:',
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
    checkReminders(client)
}, 60_000);
