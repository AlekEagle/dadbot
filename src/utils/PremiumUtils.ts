import Eris from 'eris';
import ECH from 'eris-command-handler';
import { isOwner } from './Owners';

export type PremiumStatus = boolean | undefined;

const cache: Map<string, PremiumStatus> = new Map(),
  cacheAge: { [key: string]: number } = {};

export async function checkPremiumStatus(
  client: ECH.CommandClient,
  id: string
): Promise<PremiumStatus> {
  if (await isOwner(id)) return true;

  if (cache.has(id)) {
    let rtnVal = cache.get(id);
    if (++cacheAge[id] > 10) {
      cache.delete(id);
      delete cacheAge[id];
    }
    return rtnVal;
  }

  let mem: Eris.Member;
  try {
    mem = await client.getRESTGuildMember('456542159210807307', id);
  } catch (err) {
    cache.set(id, undefined);
    cacheAge[id] = 0;
    return undefined;
  }

  cache.set(id, mem.roles.includes('788443554140913675'));
  cacheAge[id] = 0;
  return mem.roles.includes('788443554140913675');
}
