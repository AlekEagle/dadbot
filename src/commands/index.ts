import { CommandModule } from '../types';
import Joe from './Joe';
import Help from './Help';
import Eval from './Eval';

const commands: CommandModule[] = [Help, Joe, Eval];

export default commands;
