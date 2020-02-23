'use strict';

module.exports = {
    name: 'embarass',

    exec: (client, msg, args) => {
        msg.channel.createMessage(`Wow, I can't believe you don't know how to spell \`embarrass\` ${msg.member.mention}.`)
    },

    options: {
        aliases: ["embaras","embarras","wmbarrass","smbarrass","dmbarrass","fmbarrass","rmbarrass","enbarrass","ehbarrass","ejbarrass","ekbarrass","elbarrass","emvarrass","emfarrass","emgarrass","emharrass","emnarrass","embqrrass","embwrrass","embzrrass","embxrrass","embaerass","embadrass","embafrass","embagrass","embatrass","embareass","embardass","embarfass","embargass","embartass","embarrqss","embarrwss","embarrzss","embarrxss","embarraqs","embarraws","embarraes","embarrazs","embarraxs","embarracs","embarrasq","embarrasw","embarrase","embarrasz","embarrasx","embarrasc","wmbarras","smbarras","dmbarras","fmbarras","rmbarras","enbarras","ehbarras","ejbarras","ekbarras","elbarras","emvarras","emfarras","emgarras","emharras","emnarras","embqrras","embwrras","embzrras","embxrras","embaeras","embadras","embafras","embagras","embatras","embareas","embardas","embarfas","embargas","embartas","embarrqs","embarrws","embarrzs","embarrxs","embarraq","embarraw","embarrae","embarraz","embarrax","embarrac","wmbarass","smbarass","dmbarass","fmbarass","rmbarass","enbarass","ehbarass","ejbarass","ekbarass","elbarass","emvarass","emfarass","emgarass","emharass","emnarass","embqrass","embwrass","embzrass","embxrass","embaeass","embadass","embafass","embagass","embatass","embarqss","embarwss","embarzss","embarxss","embaraqs","embaraws","embaraes","embarazs","embaraxs","embaracs","embarasq","embarasw","embarase","embarasz","embarasx","embarasc","wmbaras","smbaras","dmbaras","fmbaras","rmbaras","enbaras","ehbaras","ejbaras","ekbaras","elbaras","emvaras","emfaras","emgaras","emharas","emnaras","embqras","embwras","embzras","embxras","embaeas","embadas","embafas","embagas","embatas","embarqs","embarws","embarzs","embarxs","embaraq","embaraw","embarae","embaraz","embarax","embarac"],
        hidden: true
    }
}