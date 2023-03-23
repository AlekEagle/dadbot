import {
  SlashCommand,
  SubcommandGroup,
  Subcommand,
} from "oceanic.js-interactions";

const help = new SlashCommand(
  "help",
  "Need some help learning how to use Dad Bot? Find everything you need here!"
);

const helpBasics = new Subcommand(
  "basics",
  "Learn the basics of Dad Bot!",
  {},
  {},
  async (_, interaction) => {
    await interaction.createInitialMessage({
      embeds: [
        {
          title: "Basics",
          description:
            "Thank's for using Dad Bot, here are some things you might want to know about the bot!",
          fields: [
            {
              name: "What is Dad Bot?",
              value:
                "Dad Bot is a Discord bot that responds to messages containing specific keywords with things a dad would say! Dad also has several commands to add to the fun!",
            },
            {
              name: "How do I use Dad Bot?",
              value:
                "By default, Dad Bot will automatically respond to messages containing specific keywords, you can learn more about those in `/help autoresponses`, but there is also `/dadjoke`, `/dab`, and `/barbecue` just to name a few commands!",
            },
            {
              name: "How do I stop Dad Bot from responding to messages?",
              value:
                "You can disable Dad Bot's auto responses by using the `/settings` command, auto responses can be managed server-wide, per-channel, and individually for each user! You can learn more about the settings command in `/help settings`.",
            },
            {
              name: "I still have questions!",
              value:
                "If you still have questions, want to suggest a feature, or just want to chat, join the [Dad Bot support server](https://alekeagle.com/d)!",
            },
          ],
        },
      ],
    });
  }
);

help.addSubcommand(helpBasics);

export default help;
