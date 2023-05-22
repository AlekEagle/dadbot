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
  async (interaction) => {
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
                "You can disable Dad Bot's auto responses by using the `/usersettings`, `/channelsettings`, and `/serversettings` commands, auto responses can be managed server-wide, per-channel, and individually for each user! You can learn more about the settings command in `/help settings`.",
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

const helpSettings = new Subcommand(
  "settings",
  "Manage Dad Bot settings",
  {},
  async (interaction) => {
    await interaction.createInitialMessage({
      embeds: [
        {
          title: "Settings",
          description:
            "Here are some things you might want to know about Dad Bot's settings!",
          fields: [
            {
              name: "What are Dad Bot's settings?",
              value:
                "Dad Bot's settings allow you to customize which automatic responses Dad Bot has enabled, and how often Dad Bot will respond to them! They can be configured server-wide, per-channel, and individually for each user!\n\nSettings are hierarchical, meaning that different settings zones override each other. The order of precedence is:\n**1. User Settings (if set for a specific user, overrides all other settings)**\n**2. Channel Settings (if set for a specific channel, overrides server settings)**\n**3. Server Settings (if set for a specific server, overrides default settings)**\n**4. Default Settings (if no other settings are set, these are the default settings)**",
            },
            {
              name: "How do I use Dad Bot's settings?",
              value:
                "You can use the `/usersettings`, `/channelsettings`, and `/serversettings` commands to manage Dad Bot's settings!",
            },
            {
              name: "What's the difference between the settings commands?",
              value:
                "Due to how Discord's permissions work, the original settings command had to be split into three different commands to prevent users from being able to change settings they shouldn't be able to change. The `/usersettings` command allows you to change settings for yourself, the `/channelsettings` command allows you to change settings for the current channel or a text channel you specify, and the `/serversettings` command allows you to change settings for the entire server!",
            },
            {
              name: "I still have questions!",
              value:
                "If you still have questions, join the [Dad Bot support server](https://alekeagle.com/d)!",
            },
          ],
        },
      ],
    });
  }
);

help.addSubcommand(helpSettings);

const helpAutoresponses = new Subcommand(
  "autoresponses",
  "Learn about Dad Bot's auto responses!",
  {},
  async (interaction) => {
    await interaction.createInitialMessage({
      embeds: [
        {
          title: "Auto Responses",
          description:
            "Here are some things you might want to know about Dad Bot's auto responses!",
          fields: [
            {
              name: "What is an auto response?",
              value:
                "One of Dad Bot's key features is responding to messages containing specific keywords with things a dad would say! We call these auto responses, and they can be managed using the `/usersettings`, `/channelsettings`, and `/serversettings` commands! You can learn more about the settings command in `/help settings`.",
            },
            {
              name: "How do I use Dad Bot's auto responses?",
              value:
                "Just talk in your Discord server like you normally would, if Dad Bot can read messages in the channel you're talking in, and auto responses haven't been disabled for yourself, the channel, or the server, Dad Bot will automatically respond to messages containing the special keywords!",
            },
            {
              name: "What are the keywords Dad Bot responds to?",
              value:
                "Dad has several different keywords he responds to, and Dad Bot uses something a Regular Expression to check if a message has a keyword in it allowing Dad to more accurately find the keywords, so we can't list them all here, but what we can give you are some examples below, each in their category of keywords (as well as the name of the setting to turn them on and off)",
            },
            {
              name: "Im Responses",
              value:
                "These are what Dad looks for when he pulls the classic \"Hi {blank}, I'm Dad!\" joke! (If Dad Bot has a nickname in the server, instead of saying \"Dad\", he'll use his nickname!)\n\nExamples:\n`im`, `i'm`, `i am`, etc: No response. Dad will only respond if there is something after the keywords to use.\n`im bored`: Hi bored, I'm Dad!\n`i am so hungry`: Hi so hungry, I'm Dad!\nAnd so on...",
            },
            {
              name: "Kiss Responses (formerly Kys Responses)",
              value:
                "**We're keeping this one brief because Discord isn't a fan of this kind of language.**\n\nIt's not very nice to tell someone to `[REDACTED]` themselves, so Dad Bot will make sure you're being nice and really meant \"Kissing Your Self\".\n\n`kys`: You better mean Kissing Your Self!\nAs well as some other possible variations.",
            },
            {
              name: "Shut Up Responses",
              value:
                "Telling someone to shut up isn't very nice either, so Dad will be sure to let you know that he isn't a fan of it.\n\n`shut up`, `stfu`, etc: A long and dramatic message about saying shut up that I'm too lazy to put here. - AlekEagle",
            },
            {
              name: "Winning Responses",
              value:
                "Dad tries to be encouraging, and one way to do it is by making sure you're winning your video games!\n\n`play`: I hope ya win son!\n`playing`: Are ya winning son!\n`played`: Did ya win son?",
            },
            {
              name: "Goodbye Responses",
              value:
                "Dad makes sure you know he cares about you, even when you leave!\n\n`bye dad`: a random goodbye message",
            },
            {
              name: "Thanks Responses",
              value:
                "Dad makes sure you know he cares about you, especially when you thank him!\n\n`thanks dad`: a random thanks message",
            },
            {
              name: "Shouting Responses",
              value:
                "Dad doesn't like it when you shout at him! If you are talking in all capital letters, and you aren't just using an acronym, he'll tell you to keep your voice down!",
            },
            {
              name: "I still have questions!",
              value:
                "If you still have questions, join the [Dad Bot support server](https://alekeagle.com/d)!",
            },
          ],
        },
      ],
    });
  }
);

help.addSubcommand(helpAutoresponses);

export default help;
