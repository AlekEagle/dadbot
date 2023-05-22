import { SlashCommand } from "oceanic.js-interactions";

const github = new SlashCommand(
  "github",
  "Take a look at the Dad Bot source code!!",
  {},
  {},
  (interaction) => {
    interaction.createMessage({
      content:
        "Here, as well as the other components that aren't built directly into dad, enjoy! https://github.com/AlekEagle/dadbot https://github.com/AlekEagle/dadbot-cluster-manager https://github.com/AlekEagle/dadbot-cluster-client",
    });
  }
);

export default github;
