import FeatureOptOut from './DB/FeatureOptOut';

export enum Features {
  EMBARRASS = 1 << 0,
}

export interface FeaturesObject {
  id: string;
  features: Features;
}

export function featuresToNumber(
  features: Array<keyof typeof Features>,
): number {
  let num = 0;
  for (const flag of features) {
    num |= Features[flag];
  }
  return num;
}

export function numberToFeatures(num: number): Array<keyof typeof Features> {
  const features: Array<keyof typeof Features> = [];
  for (const feature in Features) {
    if (Features[feature as keyof typeof Features] & num) {
      features.push(feature as keyof typeof Features);
    }
  }
  return features;
}

export async function isOptedOut(
  id: string,
  feature: Features,
): Promise<boolean> {
  const optOut = await FeatureOptOut.findOne({
    where: {
      id,
    },
  });

  return optOut !== null && (optOut.feature & feature) === feature;
}

export async function getOptOuts(id: string): Promise<Features> {
  const optOut = await FeatureOptOut.findOne({
    where: {
      id,
    },
  });

  if (!optOut) return 0 as Features;

  return optOut.feature;
}

export async function setOptOuts(
  id: string,
  features: Features,
): Promise<FeaturesObject> {
  const existingOptOut = await FeatureOptOut.findOne({
    where: {
      id,
    },
  });

  if (existingOptOut) {
    if (features === (0 as Features)) {
      await existingOptOut.destroy();
      return {
        id,
        features: 0 as Features,
      };
    }
    existingOptOut.feature = features;
    await existingOptOut.save();
    return {
      id,
      features,
    };
  } else {
    if (features === (0 as Features)) {
      return {
        id,
        features: 0 as Features,
      };
    }
    await FeatureOptOut.create({
      id,
      feature: features,
    });
    return {
      id,
      features,
    };
  }
}
