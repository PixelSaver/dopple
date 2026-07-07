import { App } from '@slack/bolt';

const app = new App({
    token: process.env.SLACK_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,
    socketMode: true,
});

app.message(async (event) => {
    if (event.payload.subtype) return;
    if (event.payload.user !== process.env.ID) {
    };

    // await app.client.chat.postMessage({
    //     channel: event.payload.channel,
    //     text: ':miau2:',
    // });
    event.say(':miau2: <@' + process.env.ID + '> :miau:');
})

await app.start();