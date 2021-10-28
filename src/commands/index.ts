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
import Complain from './Complain';
import Compliment from './Compliment';
import Suggest from './Suggest';
import Patreon from './Patreon';
import CreatorInfo from './CreatorInfo';
import Github from './Github';
import Invite from './Invite';

const commands: CommandModule[] = [
  Help,
  Patreon,
  CreatorInfo,
  Invite,
  Github,
  Eval,
  Shards,
  Dadjoke,
  Advice,
  Kumiko,
  Mio,
  Embarrass,
  Dab,
  MisspelledEmbarrass,
  Complain,
  Compliment,
  Suggest
];

export default commands;
