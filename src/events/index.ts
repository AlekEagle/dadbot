import { EventModule } from '../types';
import Autoresponse from './Autoresponse';
import Error from './Error';

const events: EventModule[] = [Autoresponse, Error];

export default events;
