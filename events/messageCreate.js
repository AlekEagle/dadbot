'use strict';

let settings = require('../functions/settings');
let nums = require('../functions/numbers');
let lists = require('../functions/lists');
const globalBlacklist = require('../functions/globalBlacklist');

module.exports = {
  name: 'messageCreate',

  exec: (client, msg) => {
    ++nums.msgsRead;
    /* try {
      var u = msg.member;
      if (!u) return;
      settings.getValueByID(msg.channel.guild.id).then(chanStat => {
        settings.getValueByID(msg.channel.id).then(stat => {
          if (
            !settings.toFlagsArray(stat.flags).includes('PASTA_MODE') &&
            !settings.toFlagsArray(chanStat.flags).includes('PASTA_MODE')
          )
            return;
          settings.getValueByID(msg.author.id).then(stat => {
            if (settings.toFlagsArray(stat.flags).includes('PASTA_MODE'))
              return;
            globalBlacklist.getValueByID(msg.channel.guild.id).then(stat => {
              if (stat) return;
              globalBlacklist.getValueByID(msg.channel.id).then(stat => {
                if (stat) return;
                globalBlacklist.getValueByID(msg.author.id).then(stat => {
                  if (stat) return;
                  u.edit({
                    nick:
                      lists.pastas[
                        Math.floor(Math.random() * lists.pastas.length)
                      ]
                  }).catch(() => {});
                });
              });
            });
          });
        });
      });
    } catch (err) {} */
    if (msg.author.bot) return;
    if (!msg.channel.guild) {
      return;
    }

    if (
      msg.content.match(
        /[\s\S]*?\b([i|l|\|]'?’?m|[i|l|\|] am)\b[\s\S]*?@(everyone|here)[\s\S]*/i
      )
    ) {
      msg.channel
        .createMessage(
          `Woah guys! We got a funny person here! he just tried to @${msg.content.replace(
            /[\s\S]*?\b([i|l|\|]'?’?m|[i|l|\|] am)\b[\s\S]*?@(everyone|here)[\s\S]*/i,
            '$2'
          )} by using the super funny ${msg.content.replace(
            /[\s\S]*?\b([i|l|\|]'?’?m|[i|l|\|] am)\b[\s\S]*?@(everyone|here)[\s\S]*/i,
            '$1'
          )} response! lets give this super haha funny person a round of applause!`
        )
        .catch(err => {});
      return;
    }
    settings.getValueByID(msg.channel.guild.id).then(stat => {
      if (!settings.toFlagsArray(stat.flags).includes('IM_RESPONSES')) return;
      if (
        msg.content.match(/\bplaying\b/i) &&
        settings.toFlagsArray(stat.flags).includes('WINNING_RESPONSES')
      )
        return;
      if (
        msg.content.match(/\bplayed\b/i) &&
        settings.toFlagsArray(stat.flags).includes('WINNING_RESPONSES')
      )
        return;
      if (
        msg.content.match(/\bplay\b/i) &&
        settings.toFlagsArray(stat.flags).includes('WINNING_RESPONSES')
      )
        return;
      settings.getValueByID(msg.channel.id).then(stat => {
        if (!settings.toFlagsArray(stat.flags).includes('IM_RESPONSES')) return;
        if (
          msg.content.match(/\bplaying\b/i) &&
          settings.toFlagsArray(stat.flags).includes('WINNING_RESPONSES')
        )
          return;
        if (
          msg.content.match(/\bplayed\b/i) &&
          settings.toFlagsArray(stat.flags).includes('WINNING_RESPONSES')
        )
          return;
        if (
          msg.content.match(/\bplay\b/i) &&
          settings.toFlagsArray(stat.flags).includes('WINNING_RESPONSES')
        )
          return;
        settings.getValueByID(msg.author.id).then(stat => {
          if (!settings.toFlagsArray(stat.flags).includes('IM_RESPONSES'))
            return;
          if (
            msg.content.match(/\bplaying\b/i) &&
            settings.toFlagsArray(stat.flags).includes('WINNING_RESPONSES')
          )
            return;
          if (
            msg.content.match(/\bplayed\b/i) &&
            settings.toFlagsArray(stat.flags).includes('WINNING_RESPONSES')
          )
            return;
          if (
            msg.content.match(/\bplay\b/i) &&
            settings.toFlagsArray(stat.flags).includes('WINNING_RESPONSES')
          )
            return;
          globalBlacklist.getValueByID(msg.channel.guild.id).then(stat => {
            if (stat) return;
            globalBlacklist.getValueByID(msg.channel.id).then(stat => {
              if (stat) return;
              globalBlacklist.getValueByID(msg.author.id).then(stat => {
                if (stat) return;
                if (
                  msg.content.match(
                    /[\s\S]*?\b([i|l|\|]'?’?m|[i|l|\|] am)\b\s?/i
                  )
                ) {
                  ++nums.responses;
                  if (
                    msg.content
                      .replace(
                        /[\s\S]*?\b([i|l|\|]'?’?m|[i|l|\|] am)\b\s?/i,
                        ''
                      )
                      .toLowerCase() ===
                    (msg.channel.guild.members.get(client.user.id).nick
                      ? msg.channel.guild.members
                          .get(client.user.id)
                          .nick.toLowerCase()
                      : 'dad')
                  ) {
                    msg.channel
                      .createMessage(
                        `You're not ${
                          msg.channel.guild.members.get(client.user.id).nick
                            ? msg.channel.guild.members.get(client.user.id).nick
                            : 'Dad'
                        }, I'm ${
                          msg.channel.guild.members.get(client.user.id).nick
                            ? msg.channel.guild.members.get(client.user.id).nick
                            : 'Dad'
                        }!`
                      )
                      .catch(() => {});
                    return;
                  } /* COOL SHIT
                                    let intermediate = msg.content.replace(/[\s\S]*?\b([i|l|\|]'?’?m|[i|l|\|] am)\b\s?/i, '');
                                    console.log(intermediate);
                                    intermediate.match(/(<@(!|&)?\S+>)/g).forEach(e => {
                                        switch (e.replace(/(<@(!|&)?(\S+)>)/, '$2')) {
                                            case '!':
                                            case '':
                                                intermediate = intermediate.replace(e, `@${msg.channel.guild.members.get(e.replace(/(<@(!|&)?(\S+)>)/, '$3')).nick ? msg.channel.guild.members.get(e.replace(/(<@(!|&)?(\S+)>)/, '$3')).nick : msg.channel.guild.members.get(e.replace(/(<@(!|&)?(\S+)>)/, '$3')).username}`)
                                                break;
                                            case '&':
                                                intermediate = intermediate.replace(e, `@${msg.channel.guild.roles.get(e.replace(/(<@(!|&)?(\S+)>)/, '$3')).name}`)
                                                break;
                                            default:
                                                intermediate = intermediate.replace(e, `@${msg.channel.guild.members.get(e.replace(/(<@(!|&)?(\S+)>)/, '$3')).nick ? msg.channel.guild.members.get(e.replace(/(<@(!|&)?(\S+)>)/, '$3')).nick : msg.channel.guild.members.get(e.replace(/(<@(!|&)?(\S+)>)/, '$3')).username}`)
                                                break;
                                        }
                                    }); */
                  msg.channel
                    .createMessage({
                      content: `Hi ${msg.content.replace(
                        /[\s\S]*?\b([i|l|\|]'?’?m|[i|l|\|] am)\b\s?/i,
                        ''
                      )}, I'm ${
                        msg.channel.guild.members.get(client.user.id).nick
                          ? msg.channel.guild.members.get(client.user.id).nick
                          : 'Dad'
                      }!`,
                      allowedMentions: {
                        roles: false,
                        users: false,
                        everyone: false
                      }
                    })
                    .catch(() => {});
                }
              });
            });
          });
        });
      });
    });

    settings.getValueByID(msg.channel.guild.id).then(stat => {
      if (!settings.toFlagsArray(stat.flags).includes('KYS_RESPONSES')) return;
      settings.getValueByID(msg.channel.id).then(stat => {
        if (!settings.toFlagsArray(stat.flags).includes('KYS_RESPONSES'))
          return;
        settings.getValueByID(msg.author.id).then(stat => {
          if (!settings.toFlagsArray(stat.flags).includes('KYS_RESPONSES'))
            return;
          globalBlacklist.getValueByID(msg.channel.guild.id).then(stat => {
            if (stat) return;
            globalBlacklist.getValueByID(msg.channel.id).then(stat => {
              if (stat) return;
              globalBlacklist.getValueByID(msg.author.id).then(stat => {
                if (stat) return;
                if (
                  msg.content.toLowerCase().includes('kys') ||
                  msg.content.toLowerCase().includes('kill your self') ||
                  msg.content.toLowerCase().includes('kill ur self') ||
                  msg.content.toLowerCase().includes('kill yourself')
                ) {
                  ++nums.responses;
                  msg.channel
                    .createMessage(
                      `That was very rude ${
                        msg.member.nick ? msg.member.nick : msg.member.username
                      }, instead, take your own advice.`
                    )
                    .catch(() => {});
                }
              });
            });
          });
        });
      });
    });

    settings.getValueByID(msg.channel.guild.id).then(stat => {
      if (!settings.toFlagsArray(stat.flags).includes('SHUT_UP_RESPONSES'))
        return;
      settings.getValueByID(msg.channel.id).then(stat => {
        if (!settings.toFlagsArray(stat.flags).includes('SHUT_UP_RESPONSES'))
          return;
        settings.getValueByID(msg.author.id).then(stat => {
          if (!settings.toFlagsArray(stat.flags).includes('SHUT_UP_RESPONSES'))
            return;
          globalBlacklist.getValueByID(msg.channel.guild.id).then(stat => {
            if (stat) return;
            globalBlacklist.getValueByID(msg.channel.id).then(stat => {
              if (stat) return;
              globalBlacklist.getValueByID(msg.author.id).then(stat => {
                if (stat) return;
                if (
                  msg.content.toLowerCase().includes('shut up') ||
                  msg.content.toLowerCase().includes('shut your up') ||
                  msg.content.toLowerCase().includes('stfu') ||
                  msg.content.toLowerCase().includes('shut the fuck up') ||
                  msg.content.toLowerCase().includes('shut ur up') ||
                  msg.content
                    .toLowerCase()
                    .includes('shut the hell your mouth') ||
                  msg.content.toLowerCase().includes('shut the hell your up')
                ) {
                  ++nums.responses;
                  msg.channel
                    .createMessage(
                      `Listen here ${
                        msg.member.nick ? msg.member.nick : msg.member.username
                      }, I will not tolerate you saying the words that consist of the letters 's h u t  u p' being said in this server, so take your own advice and close thine mouth in the name of the christian minecraft server owner.`
                    )
                    .catch(() => {});
                }
              });
            });
          });
        });
      });
    });

    settings.getValueByID(msg.channel.guild.id).then(stat => {
      if (!settings.toFlagsArray(stat.flags).includes('WINNING_RESPONSES'))
        return;
      settings.getValueByID(msg.channel.id).then(stat => {
        if (!settings.toFlagsArray(stat.flags).includes('WINNING_RESPONSES'))
          return;
        settings.getValueByID(msg.author.id).then(stat => {
          if (!settings.toFlagsArray(stat.flags).includes('WINNING_RESPONSES'))
            return;
          globalBlacklist.getValueByID(msg.channel.guild.id).then(stat => {
            if (stat) return;
            globalBlacklist.getValueByID(msg.channel.id).then(stat => {
              if (stat) return;
              globalBlacklist.getValueByID(msg.author.id).then(stat => {
                if (stat) return;
                if (msg.content.match(/\bplaying\b/i)) {
                  ++nums.responses;
                  msg.channel
                    .createMessage(`Are ya winnin' son?`)
                    .catch(() => {});
                }
                if (msg.content.match(/\bplayed\b/i)) {
                  ++nums.responses;
                  msg.channel.createMessage(`Did ya win son?`).catch(() => {});
                }
                if (msg.content.match(/\bplay\b/i)) {
                  ++nums.responses;
                  msg.channel
                    .createMessage(`I hope you win son!`)
                    .catch(() => {});
                }
              });
            });
          });
        });
      });
    });
  }
};
