import { CommandModule } from '../types';

const Grandpa: CommandModule = {
  name: 'grandpa',

  handler:
    "Wanna add my dad to your server? Here's the link to invite him! https://discord.com/api/oauth2/authorize?client_id=957709454583947276&permissions=535260822592&scope=bot%20applications.commands",
  
  options: {
    description: 'Invite my dad to your server!'
  }
};

export default Grandpa;