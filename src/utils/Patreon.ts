const PATREON_API_URL = 'https://www.patreon.com/api/oauth2/v2';

export type PatreonUser = {
  amount: number;
  status: 'active' | 'former' | 'declined';
  full_name: string;
  fetched_at: Date;
};

// Cache the Patreon API response for 30 minutes.
let cached: {
  [key: string]: PatreonUser;
} = {};

export async function getLatestSupporter(): Promise<any> {
  const response = await fetch(
      `${PATREON_API_URL}/campaigns/${process.env.PATREON_CAMPAIGN_ID}/members?include=currently_entitled_tiers&fields%5Bmember%5D=full_name,patron_status,currently_entitled_amount_cents,will_pay_amount_cents,lifetime_support_cents,pledge_relationship_start&fields%5Buser%5D=full_name,social_connections`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.PATREON_ACCESS_TOKEN}`,
        },
      },
    ),
    json: any = await response.json(),
    members = json.data;

  // Sort the members by descending date started, excluding declined and former members, and return the first one.
  const member = members
    .filter(
      (m: any) =>
        m.attributes.patron_status !== 'declined' &&
        m.attributes.patron_status !== 'former_patron',
    )
    .sort((a: any, b: any) => {
      const aDate = new Date(a.attributes.pledge_relationship_start),
        bDate = new Date(b.attributes.pledge_relationship_start);

      return bDate.getTime() - aDate.getTime();
    })[0];

  if (member == null) {
    throw new Error('No active members found.');
  }

  return member;
}

export async function getSupporterByDiscordID(
  id: string,
): Promise<PatreonUser | null> {
  if (cached[id] != null) {
    if (cached[id].fetched_at.getTime() + 30 * 60 * 1000 > Date.now()) {
      return cached[id];
    } else {
      delete cached[id];
    }
  }

  const fetchedAt = new Date(Date.now()),
    response = await fetch(
      `${PATREON_API_URL}/campaigns/${process.env.PATREON_CAMPAIGN_ID}/members?include=user&fields%5Buser%5D=social_connections,full_name&fields%5Bmember%5D=patron_status,currently_entitled_amount_cents`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.PATREON_ACCESS_TOKEN}`,
        },
      },
    ),
    json: any = await response.json(),
    members = json.data;

  const user = json.included.find(
    (i: any) =>
      i.type === 'user' &&
      i.attributes.social_connections?.discord?.user_id === id,
  );

  if (user == null) {
    return null;
  }

  const member = members.find(
    (m: any) => m.relationships.user.data.id === user.id,
  );

  const patreonStatus =
    member.attributes.patron_status === 'active_patron'
      ? 'active'
      : member.attributes.patron_status === 'former_patron'
      ? 'former'
      : member.attributes.patron_status === 'declined_patron'
      ? 'declined'
      : 'unknown';

  if (patreonStatus === 'unknown') {
    throw new Error('Unknown Patreon status.');
  }

  cached[id] = {
    amount: member.attributes.currently_entitled_amount_cents,
    status: patreonStatus,
    full_name: user.attributes.full_name,
    fetched_at: fetchedAt,
  };

  return cached[id];
}
