import Owners from './DB/Owners';

export async function getAllOwners(): Promise<Owners[]> {
  return await Owners.findAll();
}

export async function getOwner(id: string): Promise<Owners | null> {
  return await Owners.findOne({
    where: {
      id,
    },
  });
}

export async function isOwner(
  id: string,
  admin: boolean = false,
): Promise<boolean> {
  let res = await Owners.findOne({
    where: {
      id,
    },
  });
  if (!res) return false;
  return admin ? res.admin : true;
}

export async function addOwner(
  managee: string,
  newOwner: string,
  admin: boolean = false,
): Promise<void> {
  let manageeStatus = await getOwner(managee);
  if (!manageeStatus || (admin && !manageeStatus.admin))
    throw new Error('Missing permissions.');

  try {
    await Owners.create({ id: newOwner, admin });
  } catch (error) {
    throw error;
  }
  return;
}

export async function removeOwner(
  managee: string,
  oldOwner: string,
): Promise<void> {
  let manageeStatus = await getOwner(managee),
    oldOwnerStatus = await getOwner(oldOwner);
  if (!manageeStatus || (oldOwnerStatus.admin && !manageeStatus.admin))
    throw new Error('Missing permissions.');

  try {
    Owners.destroy({
      where: {
        id: oldOwner,
      },
    });
  } catch (error) {
    throw error;
  }
  return;
}
