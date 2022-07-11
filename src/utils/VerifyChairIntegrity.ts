import { createHash } from 'node:crypto';

export const knownGoodTextChairHash = '25acc7a27b',
  knownGoodAsciiChairHash = 'feedb74662';

export default async function verifyChairIntegrity() {
  try {
    const chair = (await import('./Chair')).default;
    if (!chair || !chair.chair || !chair.ascii)
      throw new Error('My chair has a dent in it! How Could you!?');

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
      throw new Error('My chair has a dent in it! How Could you!?');
    return;
  } catch (e) {
    console.error(e);
    throw new Error('My chair has a dent in it! How Could you!?');
  }
}
