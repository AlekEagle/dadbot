# Dad Bot

Welcome to the GitHub repository for Dad Bot. Dad Bot has become a much larger project than I would've ever expected, and I thank everyone who uses the bot, the people who have contributed to it, people who give suggestions to improve the bot, and etc. This bot wouldn't be anywhere near where it is without the support of everyone who uses the bot.

## Contributing

Contributing is super simple, you can fork the repo, make your contribution, and make a PR. AlekEagle will review the PR, and do the normal PR review thingys.

## Running Your Own Instance

Dad Bot is a bit of a complicated mess, but don't worry, we can go through it together. Dad Bot uses a few services and modules that aren't included. One of them is [dadbot-cluster-client](https://github.com/AlekEagle/dadbot-cluster-client), this should be in the same directory as the root directory of Dad Bot, so it should look something like this:

```
|
+-- dadbot/
|
+-- dadbot-cluster-client/
```

The next thing you want is the [dadbot-cluster-manager](https://github.com/AlekEagle/dadbot-cluster-manager). If you didn't catch on, Dad Bot is large enough that it needs to be split into multiple "clusters." A cluster in this context is just a process that handles a portion of Dad Bot's shards. The cluster manager can be placed anywhere you want it to be, but in this demonstration I'll be placing it in the same directory as everything else. so it should look something like this:

```
|
+-- dadbot/
|
+-- dadbot-cluster-client/
|
+-- dadbot-cluster-manager/
```

Next, we need to install the node modules for everything, so in each directory, run `npm i` in each repo. Then, you need to run `npm run build` in all of the directories as well since they are all TypeScript projects. After that, create a .env file in the root directory of this project, model it with valid data, with the same keys of `example.env`. Then spin up the cluster manager with its included instructions, and then spin up Dad Dot with the additional environment variables `NODE_APP_INSTANCE=instance id 0 indexed` and `instances=# of total instances`. That should be it!
