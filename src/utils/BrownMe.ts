import BrownMe from './DB/BrownMe';

export async function getBrownMe(id: string): Promise<BrownMe | null> {
  const brownMe = await BrownMe.findOne({
    where: {
      id,
    },
  });

  return brownMe;
}

export async function enableBrownMe(
  id: string,
  roleID: string,
): Promise<BrownMe> {
  const existingBrownMe = await BrownMe.findOne({
    where: {
      id,
    },
  });

  if (existingBrownMe) {
    existingBrownMe.roleID = roleID;
    await existingBrownMe.save();
    return existingBrownMe;
  } else {
    const newBrownMe = await BrownMe.create({
      id,
      roleID,
    });
    return newBrownMe;
  }
}

export async function disableBrownMe(id: string): Promise<void> {
  const existingBrownMe = await BrownMe.findOne({
    where: {
      id,
    },
  });

  if (existingBrownMe) {
    await existingBrownMe.destroy();
  }
}

export async function isBrownMeEnabled(
  id: string,
): Promise<{ enabled: boolean; roleID?: string }> {
  const brownMe = await BrownMe.findOne({
    where: {
      id,
    },
  });

  if (brownMe) {
    return { enabled: true, roleID: brownMe.roleID };
  } else {
    return { enabled: false };
  }
}
