# Dad Bot

Welcome to the GitHub repository for Dad Bot. Based on the original Dad Bot made by [@Reaxt](https://github.com/Reaxt) that was shut down. Dad Bot has become a much larger project than I would've ever expected, and I thank everyone who uses the bot, the people who have contributed to it, people who give suggestions to improve the bot, and etc. This bot wouldn't be anywhere near where it is without the support of everyone who uses the bot.

## Contributing

Contributing is super simple, you can fork the repo, make your contribution, and make a PR. AlekEagle will review the PR, and do the normal PR review thingys.

## Running Your Own Instance

Dad Bot is an absolute mess of code, and I'm sorry. I'm working on cleaning it up, but it's a slow process. If you want to run your own instance of Dad Bot, you can do so by following these steps:

1. Clone the necessary repos

   - Dad Bot (this repo)
   - [Dad Bot Cluster Manager](https://github.com/AlekEagle/dadbot-cluster-manager)
   - [Dad Bot Cluster Client](https://github.com/AlekEagle/dadbot-cluster-client)

2. Organize the repos like so:

   ```txt
    |
    +-- dadbot
    |
    +-- dadbot-cluster-manager
    |
    +-- dadbot-cluster-client
   ```

3. Install the dependencies for each repo
4. Transpile the TypeScript for each repo
5. Prepare a PostgreSQL database for Dad Bot (Dad Bot deserves his own database, he'll create his own tables as needed)
6. Prepare Dad Bot's `.env` file (There is an `example.env` file in the repo, use that as a template)
7. Make sure the cluster manager is configured correctly (Those instructions are in the cluster manager repo)
8. (Optional, but recommended for production environments) Place the `dadbot-cluster@.service` file in `/etc/systemd/system/` and enable it with `systemctl enable dadbot-cluster@<ClusterID>.service` (Replace `<ClusterID>` with the ID of the cluster you want to enable and repeat for each cluster you want to enable)
9. Run the damn thing.
   - Systemd service: `systemctl start dadbot-cluster@0.service ...`
   - Manually: (Make sure you manually set `CLUSTER_ID` in the `.env` file or in the environment) `node .`

Want to run Dad in debug mode? Set the `DEBUG` environment variable to `true` in the `.env` file or in the environment and run the damn thing again.
