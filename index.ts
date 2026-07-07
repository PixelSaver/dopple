import { App } from '@slack/bolt';

const app = new App({
    token: process.env.SLACK_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,
    socketMode: true,
});



await app.start();