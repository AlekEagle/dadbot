import { incrementBarbecuesServed } from "../utils/Statistics";
import { SlashCommand } from "oceanic.js-interactions";

const barbecue = new SlashCommand(
  "barbecue",
  "Mmm tasty.",
  {},
  {},
  (_, interaction) => {
    incrementBarbecuesServed();
    interaction.createMessage({
      embeds: [
        {
          title: "Here's your hotdog",
          image: {
            url: "https://alekeagle.me/8YgKdGJORB.png",
          },
        },
      ],
    });
  }
);

export default barbecue;
