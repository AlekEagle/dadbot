import {
  PartialEmoji,
  GuildTextableChannel,
  Message,
  MessageContent,
  User
} from 'eris';
import ECH from 'eris-command-handler';
import ms from 'ms';

type ReactionHandler = (
  message: Message<GuildTextableChannel>,
  user: User
) => void | Promise<void>;

export interface ReactionMenuState {
  reactions: EmojiMap;
  message: MessageContent | (() => MessageContent | Promise<MessageContent>);
}

export class EmojiMap extends Map<PartialEmoji, ReactionHandler> {
  constructor(
    entries?: readonly (readonly [PartialEmoji, ReactionHandler])[] | null
  ) {
    super(entries);
  }

  get(key: PartialEmoji): ReactionHandler | undefined {
    let reactions = Array.from(this.entries());
    let value = reactions.find(
      r => r[0].id === key.id && r[0].name === key.name
    );
    return value ? value[1] : undefined;
  }

  has(key: PartialEmoji): boolean {
    let reactions = Array.from(this.keys());
    let value = reactions.find(r => r.id === key.id && r.name === key.name);
    return !!value;
  }

  delete(key: PartialEmoji): boolean {
    let reactions = Array.from(this.keys());
    let origKey = reactions.find(r => r.id === key.id && r.name === key.name);
    if (!origKey) return false;
    return super.delete(origKey);
  }
}

export default class ReactionMenu {
  private client: ECH.CommandClient;
  private channel: GuildTextableChannel;
  private originalMessage: Message<GuildTextableChannel>;
  private reactors: string[] = [];
  private state: string = 'default';
  private ready: boolean = false;
  private states: Map<string, ReactionMenuState> = new Map();
  private message: Message<GuildTextableChannel>;
  private timeout: NodeJS.Timeout;
  private timeoutDur: number;
  private reactionHandlerInstance: (
    msg: Message<GuildTextableChannel>,
    emoji: PartialEmoji,
    user: User
  ) => void;

  constructor(
    client: ECH.CommandClient,
    msg: Message<GuildTextableChannel>,
    defaultState: ReactionMenuState,
    timeout?: number | string
  ) {
    this.client = client;
    this.originalMessage = msg;
    this.channel = this.originalMessage.channel;
    this.timeoutDur =
      timeout !== undefined
        ? typeof timeout === 'number'
          ? timeout
          : typeof timeout === 'string'
          ? ms(timeout)
          : ms('1m')
        : ms('1m');
    this.reactors.push(msg.author.id);
    if (
      !this.channel.permissionsOf(this.client.user.id).has('manageMessages')
    ) {
      this.channel.createMessage(
        "Well, that's embarrassing, but it looks like I don't have the permission to manage messages in this channel, please check the permissions of the channel and make sure I can manage messages! (Note: I only need to be able to manage messages to: delete the message that initiated this command, bulk remove reactions on the menu, and remove other users' reactions.)"
      );
      throw new Error('Missing MANAGE_MESSAGES');
    }
    this.states.set('default', defaultState);
    this.reactionHandlerInstance = this.reactionAddListener.bind(this);
    this.client.on('messageReactionAdd', this.reactionHandlerInstance);
    this.sendMenuMessage();
  }

  private async sendMenuMessage() {
    let msg = this.states.get('default').message;
    this.message = await this.channel.createMessage(
      typeof msg === 'function' ? await msg() : msg
    );
    await this.addReactions(
      Array.from(this.states.get(this.state).reactions.keys())
    );
    this.restartInactivityTimer();
    this.ready = true;
  }

  private reactionAddListener(
    msg: Message<GuildTextableChannel>,
    emoji: PartialEmoji,
    user: User
  ) {
    if (msg.id === this.message.id && user.id !== this.client.user.id)
      this.message.removeReaction(
        emoji.id ? `${emoji.name}:${emoji.id}` : emoji.name,
        user.id
      );
    if (
      msg.id === this.message.id &&
      this.reactors.includes(user.id) &&
      this.ready
    )
      this.handleReaction(emoji, user);
  }

  private async handleReaction(emoji: PartialEmoji, user: User) {
    this.restartInactivityTimer();
    if (!this.states.has(this.state))
      throw new Error(`State '${this.state}' does not exist`);
    if (
      Array.from(this.states.get(this.state).reactions.entries()).find(
        e => e[0].name === emoji.name && e[0].id === emoji.id
      )
    )
      await Array.from(this.states.get(this.state).reactions.entries()).find(
        e => e[0].name === emoji.name && e[0].id === emoji.id
      )[1](this.message, user);
    let msg = this.states.get(this.state).message;
    if (typeof msg === 'function') {
      this.message.edit(await msg());
    }
  }

  public restartInactivityTimer() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.endMenu.bind(this, [true]), this.timeoutDur);
  }

  public async endMenu(fromTimeout: boolean = false) {
    try {
      await this.originalMessage.delete();
    } catch (err) {}
    try {
      await this.message.delete();
    } catch (err) {}
    this.client.off('messageReactionAdd', this.reactionHandlerInstance);
    clearTimeout(this.timeout);
    if (fromTimeout) {
      let timeoutMessage = await this.channel.createMessage(
        `${this.originalMessage.author.mention} menu timed-out due to inactivity!`
      );
      setTimeout(() => timeoutMessage.delete(), ms('5s'));
    }
  }

  private async addReactions(reactions: PartialEmoji[]) {
    if (reactions.length < 1) return;
    let ind = 0;
    let addReaction = async (): Promise<void> => {
      try {
        await this.message.addReaction(
          reactions[ind].id
            ? `${reactions[ind].name}:${reactions[ind].id}`
            : reactions[ind].name
        );
      } catch (error) {
        throw error;
      }
      if (!reactions[++ind]) return;
      else return await addReaction();
    };

    return await addReaction();
  }

  public async resendMessage() {
    await this.message.delete();
    await this.sendMenuMessage();
  }
}
