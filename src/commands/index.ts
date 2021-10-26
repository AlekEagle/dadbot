import { CommandModule } from '../types';
import Help from './Help';
import Eval from './Eval';
import Shards from './Shards';
import Dadjoke from './Dadjoke';
import Advice from './Advice';
import Kumiko from './Kumiko';
import Mio from './Mio';
import Embarrass from './Embarrass';
import Dab from './Dab';
import MisspelledEmbarrass from './MisspelledEmbarrass';

const commands: CommandModule[] = [
  Help,
  Eval,
  Shards,
  Dadjoke,
  Advice,
  Kumiko,
  Mio,
  Embarrass,
  Dab,
  MisspelledEmbarrass
];

export default commands;
