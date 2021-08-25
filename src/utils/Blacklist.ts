import GBlacklist from './DB/GlobalBlacklist';

export async function getValueByID(id: string) {
  let res = await GBlacklist.findOne({
    where: {
      id
    }
  });
  return res;
}