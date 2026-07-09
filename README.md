# Doppler

## About

A slackbot which can do a random assortment of things. Made for the Doppel YSWS Program by HackClub. 

## Features

- !meow - Bot meows for you (why?)
- !emote - Get a random emote (e.g. `!emote happy`)
- !help - Show this help message
- !register - Register yourself for using this bot
- !deregister - Deregister yourself from using this bot
- !remindme - *Set a reminder (`!remindme <time (tomorrow, in three days, etc.)> to <reminder text>`)
*All commands with this star means you have to be registered to use it. Still working on that though.

## Deploying for yourself

Make sure the .env file has the following things.
```env
SLACK_TOKEN="xoxb-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
SLACK_APP_TOKEN="xapp-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
SLACK_USER_TOKEN="xoxp-1-A0BFW8EFY6Q-11538554845649-44e351d0b4686672c161955d9b22a2698a3c4ff141460615c6b185af1267c3df"
ME_ID="UXXXXXXXXX"
```
Also, the bot reads emotes from `./data/emotes.yaml`, in the following format:
```yaml
- emote: ":miau:"
  tags:
    - cat
    - meow
    - regular
```
Lastly, clone the repo, install bun, and run the index.ts file.
```bash
git clone https://github.com/pixelsaver/dopple
cd dopple
## If you have bun installed
bun index.ts
```


## Notes for myself

When updating stuff, make sure it's updated on nest too!
```bash
scp .env <username>@hackclub.app:~/dopple/.env
scp ./data/emotes.yaml <username>@hackclub.app:~/dopple/data/emotes.yaml
scp ./data/users.json <username>@hackclub.app:~/dopple/data/users.json
```