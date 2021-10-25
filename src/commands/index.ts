import { CommandModule } from '../types';
import Help from './Help';
import Eval from './Eval';
import Shards from './Shards';

const commands: CommandModule[] = [Help, Eval, Shards];

export default commands;
