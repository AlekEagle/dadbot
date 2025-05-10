const PATREON_API_URL = 'https://www.patreon.com/api/oauth2/v2';

export type PatreonUser = {
  amount: number;
  status: 'active' | 'former' | 'declined' | 'free';
  discord_id?: string;
  full_name: string;
  fetched_at: Date;
  joined_at?: Date;
};

// Cache the Patreon API response for 30 minutes.
let cached: PatreonUser[] = [];

let cacheTimeout: NodeJS.Timeout | null = null;

export async function getAllMembers(): Promise<void> {
  async function getMembersFromPage(
    page: string = `${PATREON_API_URL}/campaigns/${process.env.PATREON_CAMPAIGN_ID}/members?include=currently_entitled_tiers,user&fields%5Bmember%5D=full_name,patron_status,currently_entitled_amount_cents,will_pay_amount_cents,lifetime_support_cents,pledge_relationship_start&fields%5Buser%5D=social_connections,full_name&sort=-pledge_relationship_start&page%5Bsize%5D=500`,
  ) {
    const fetchedAt = new Date(Date.now());
    const response = await fetch(page, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PATREON_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch members from Patreon API: ${response.statusText}`,
      );
    }

    const json: any = await response.json(),
      members = json.data,
      users = json.included;

    // Merge and cache the members and users.
    members.forEach((member: any) => {
      const user = users.find(
        (i: any) => i.id === member.relationships.user.data.id,
      );
      if (user == null) {
        return;
      }
      const patreonStatus =
        member.attributes.patron_status === 'active_patron'
          ? 'active'
          : member.attributes.patron_status === 'former_patron'
          ? 'former'
          : member.attributes.patron_status === 'declined_patron'
          ? 'declined'
          : member.attributes.patron_status === null
          ? 'free'
          : 'unknown';
      if (patreonStatus === 'unknown') {
        throw new Error('Unknown Patreon status.');
      }
      cached.push({
        amount: member.attributes.currently_entitled_amount_cents,
        status: patreonStatus,
        discord_id: user.attributes.social_connections.discord
          ? user.attributes.social_connections.discord.user_id
          : null,
        full_name: user.attributes.full_name,
        fetched_at: fetchedAt,
        joined_at: new Date(member.attributes.pledge_relationship_start),
      });
    });

    // Check if there are more pages to fetch.
    if (json.meta.pagination?.cursors?.next) {
      await getMembersFromPage(
        `${PATREON_API_URL}/campaigns/${process.env.PATREON_CAMPAIGN_ID}/members?include=currently_entitled_tiers,user&fields%5Bmember%5D=full_name,patron_status,currently_entitled_amount_cents,will_pay_amount_cents,lifetime_support_cents,pledge_relationship_start&fields%5Buser%5D=social_connections,full_name&sort=-pledge_relationship_start&page%5Bsize%5D=500&cursor=${json.meta.pagination.cursors.next}`,
      );
    }
  }
  // Clear the cache before fetching.
  cached = [];
  // Fetch the members from the first page.
  await getMembersFromPage();
}

export function getLatestSupporter(): PatreonUser | null {
  // Check if the cache is empty.
  if (cached.length === 0) {
    return null;
  }
  // Get the newest supporter from the cached members.
  const members = Object.values(cached).filter(
    (member) => member.status === 'active',
  );
  members.sort((a, b) => {
    return new Date(b.joined_at!).getTime() - new Date(a.joined_at!).getTime();
  });
  const member = members[0];

  return member;
}

export function getSupporterByDiscordID(discordID: string): PatreonUser | null {
  // Check if the cache is empty.
  if (cached.length === 0) {
    return null;
  }
  // Get the supporter from the cached members.
  const member = cached.find((member) => member.discord_id === discordID);
  if (member == null) {
    return null;
  }
  return member;
}

export async function startCacheRefresh(): Promise<void> {
  // Check if the cache is empty.
  if (cached.length === 0) {
    await getAllMembers();
  }
  // Set a timeout to refresh the cache every 30 minutes.
  if (cacheTimeout) {
    clearTimeout(cacheTimeout);
  }
  cacheTimeout = setTimeout(async () => {
    // Clear the cache before fetching.
    cached = [];
    // Fetch fresh members from the Patreon API.
    await getAllMembers();
    // Set the timeout again.
    cacheTimeout = setTimeout(startCacheRefresh, 30 * 60 * 1000);
  }, 30 * 60 * 1000);
}

export function stopCacheRefresh(): void {
  // Clear the timeout if it exists.
  if (cacheTimeout) {
    clearTimeout(cacheTimeout);
    cacheTimeout = null;
  }
}

export function getCachedMembers(): PatreonUser[] {
  return cached;
}
