import { App } from '@slack/bolt';

const app = new App({
    token: process.env.SLACK_TOKEN,
});

// define logic for App
// 
await app.start();