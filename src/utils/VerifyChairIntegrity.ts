import { createHash } from 'node:crypto';
import { DentInChairError } from './DentInChairError';

export const knownGoodTextChairHash = '25acc7a27b',
  knownGoodAsciiChairHash = 'feedb74662';

export default async function verifyChairIntegrity() {
  try {
    const chair = (await import('./Chair')).default;
    if (!chair || !chair.chair || !chair.ascii) throw new DentInChairError();

    const textChairHash = createHash('shake256', { outputLength: 5 })
        .update(chair.chair)
        .digest('hex'),
      asciiChairHash = createHash('shake256', { outputLength: 5 })
        .update(chair.ascii)
        .digest('hex');

    if (
      knownGoodAsciiChairHash !== asciiChairHash ||
      knownGoodTextChairHash !== textChairHash
    )
      throw new DentInChairError();
    return;
  } catch (e) {
    console.error(e);
    throw new DentInChairError();
  }
}
