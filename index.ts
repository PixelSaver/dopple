import { App } from '@slack/bolt';
import { WebClient } from '@slack/web-api';

const app = new App({
    token: process.env.SLACK_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,
    socketMode: true,
});
const client = new WebClient(process.env.SLACK_USER_TOKEN);

app.message(async (event) => {
    if (event.payload.subtype) return;
    if (event.payload.user !== process.env.ID) {
        return;
    };

    // await app.client.chat.postMessage({
    //     channel: event.payload.channel,
    //     text: ':miau2:',
    // });
    
    // event.say(':miau2: <@' + process.env.ID + '> :miau:');
    await client.chat.postMessage({
        channel: event.payload.channel,
        text: ':miau2: <@' + process.env.ID + '> :miau:',
    });
})

await app.start();