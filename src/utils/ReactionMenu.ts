import {
  PartialEmoji,
  GuildTextableChannel,
  Message,
  MessageContent,
  User,
  Client
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

// EmojiMap is identical to a normal map, but re-implements functions that have to do with retrieving data so that you do not have to have identical Objects for accessing values.
// EmojiMap avoids using Object equivalence to compare keys, and instead compares the contents within the Object.
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

/**
 * @name ReactionMenu
 * @description ReactionMenu is a class that can be used to create a simple menu that can be used by users to interact with the bot in a intuitive way.
 */
export default class ReactionMenu {
  private isDeleted: boolean = false;
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

  /**
   * ReactionMenu Constructor
   * @param {Client} client The Eris client
   * @param {Message<GuildTextableChannel>} msg Any guild channel that can have messages sent to it.
   * @param {ReactionMenuState} defaultState The state the ReactionMenu will initially start with.
   * @param {string|number} [timeout=60000] The time the menu will be open for before it closes from inactivity.
   */
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
    this.sendMenuMessage().then(
      () => {
        this.reactionHandlerInstance = this.reactionAddListener.bind(this);
        this.client.on('messageReactionAdd', this.reactionHandlerInstance);
      },
      err => {
        throw err;
      }
    );
  }

  private async sendMenuMessage() {
    let msg = this.states.get('default').message;
    this.message = await this.channel.createMessage(
      typeof msg === 'function' ? await msg() : msg
    );
    try {
      await this.addReactions(
        Array.from(this.states.get(this.state).reactions.keys())
      );
    } catch (err) {
      throw err;
    }
    this.restartInactivityTimer();
    this.ready = true;
  }

  private reactionAddListener(
    msg: Message<GuildTextableChannel>,
    emoji: PartialEmoji,
    user: User
  ) {
    try {
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
    } catch (error) {
      console.error(error);
      console.log(this.message, this.originalMessage);
    }
  }

  private async handleReaction(emoji: PartialEmoji, user: User) {
    this.restartInactivityTimer();
    if (!this.states.has(this.state))
      throw new Error(`State '${this.state}' does not exist`);
    if (this.states.get(this.state).reactions.has(emoji))
      await this.states.get(this.state).reactions.get(emoji)(
        this.message,
        user
      );
    if (this.isDeleted) return;
    let msg = this.states.get(this.state).message;
    if (typeof msg === 'function') {
      await this.message.edit(await msg());
    }
  }

  /**
   * Restarts the inactivity timer to the current timeoutDur.
   *
   * @returns {void}
   */
  public restartInactivityTimer() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.endMenu.bind(this, [true]), this.timeoutDur);
  }

  /**
   * Closes the ReactionMenu
   * @param {boolean} [fromTimeout=false] Wether or not the menu ended from the menu timing out.
   */
  public async endMenu(fromTimeout: boolean = false) {
    this.isDeleted = true;
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

  /**
   * Resends the message in the channel.
   *
   * @returns {Promise<void>}
   */
  public async resendMessage() {
    await this.message.delete();
    await this.sendMenuMessage();
    return;
  }

  /**
   * Changes the state of the ReactionMenu to another state.
   * @param {string} state The state to switch to.
   *
   * @returns {Promise<void>}
   * @throws {Error} Throws an error if state does not exist
   */
  public async setState(state: string) {
    if (!this.states.has(state))
      throw new Error(`State "${state}" does not exist.`);
    this.ready = false;
    this.state = state;
    await this.message.removeReactions();
    let stateObj = this.states.get(this.state);
    if (typeof stateObj.message === 'function')
      this.message.edit(await stateObj.message());
    else this.message.edit(stateObj.message);
    await this.addReactions(Array.from(stateObj.reactions.keys()));
    this.ready = true;
    return;
  }

  /**
   * Adds a new state to the ReactionMenu
   * @param state Name of the new state.
   * @param reactionMenuState The reaction menu state structure for this state.
   *
   * @returns {ReactionMenu}
   * @throws {Error} Throws an error if the state already exists.
   */
  public addState(
    state: string,
    reactionMenuState: ReactionMenuState
  ): ReactionMenu {
    if (this.states.has(state))
      throw new Error(`State "${state}" already exists.`);
    this.states.set(state, reactionMenuState);
    return this;
  }

  /**
   * Removes a state from the ReactionMenu
   * @param state State to remove.
   * @returns {ReactionMenu}
   * @throws {Error} Throws an error if the state you are trying to remove is the current state or if the state does not exist.
   */
  public removeState(state: string): ReactionMenu {
    if (this.state === state)
      throw new Error("This is the ReactionMenu's current state.");
    if (!this.states.has(state))
      throw new Error(`State "${state}" does not exist.`);
    this.states.delete(state);
    return this;
  }

  /**
   * Add another reaction to the reaction state.
   * @param state The state you want to add the reaction to.
   * @param reaction The reaction you want to add.
   * @param handler The handler for the reaction.
   * @returns {ReactionMenu}
   * @throws {Error} Throws an error when the state does not exist or if the reaction already exists on the state.
   */
  public addReaction(
    state: string,
    reaction: PartialEmoji,
    handler: ReactionHandler
  ): ReactionMenu {
    if (!this.states.has(state))
      throw new Error(`State "${state}" does not exist.`);
    if (this.states.get(state).reactions.has(reaction))
      throw new Error(`This reaction already exists on state "${state}"`);
    this.states.get(state).reactions.set(reaction, handler);
    if (this.state === state) {
      this.ready = false;
      this.addReactions([reaction]).then(() => {
        this.ready = true;
      });
    }

    return this;
  }

  /**
   * Remove reaction from the reaction state.
   * @param state The state you want to remove the reaction from.
   * @param reaction The reaction you want to remove.
   * @returns {ReactionMenu}
   * @throws {Error} Throws an error when the state does not exist or if the reaction already exists on the state.
   */
  public removeReaction(state: string, reaction: PartialEmoji): ReactionMenu {
    if (!this.states.has(state))
      throw new Error(`State "${state}" does not exist.`);
    if (!this.states.get(state).reactions.has(reaction))
      throw new Error(`This reaction does not exist on state "${state}"`);
    this.states.get(state).reactions.delete(reaction);
    if (this.state === state) {
      this.ready = false;
      this.message
        .removeReactionEmoji(
          reaction.id ? `${reaction.name}:${reaction.id}` : reaction.name
        )
        .then(() => {
          this.ready = true;
        });
    }
    return this;
  }
}
