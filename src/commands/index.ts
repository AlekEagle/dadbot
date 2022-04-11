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
import FDelete from './FDelete';
import FReply from './FReply';
import Info from './Info';
import Settings from './Settings';
import Barbecue from './Barbecue';
import Grandpa from './Grandpa';
import SetPlayingStatus from './SetPlayingStatus';
import MessWithAlek from './MessWithAlek';

const commands: CommandModule[] = [
  Help,
  Patreon,
  CreatorInfo,
  Invite,
  Github,
  MessWithAlek,
  Grandpa,
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
  Suggest,
  FDelete,
  FReply,
  Info,
  Settings,
  Barbecue,
  SetPlayingStatus
];

export default commands;
