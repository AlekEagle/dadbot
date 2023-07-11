import fetch from "node-fetch";
import { Constants } from "oceanic.js";
import { isDebug } from "..";

export let cachedShardAllocation: ShardAllocation | null = null;

export interface ShardAllocationRange {
  start: number;
  end: number;
  count: number;
}

export interface ShardAllocation {
  total: number;
  totalSessions: number;
  remainingSessions: number;
  resetsIn: number;
  maxConcurrent: number;
  thisCluster: ShardAllocationRange;
  allClusters: ShardAllocationRange[];
}

export interface ShardAllocatorOptions {
  token: string;
  clusterID: number;
  clusters: number;
  force?: boolean;
}

export async function getShardAllocation(
  options: ShardAllocatorOptions
): Promise<ShardAllocation> {
  const { token, clusterID, clusters, force } = options,
    url = `https://discord.com/api/v${Constants.REST_VERSION}/gateway/bot`,
    headers = {
      Authorization: `Bot ${token}`,
    },
    body: ShardAllocation = {
      total: -1,
      totalSessions: -1,
      remainingSessions: -1,
      resetsIn: -1,
      maxConcurrent: -1,
      thisCluster: {
        start: -1,
        end: -1,
        count: -1,
      },
      allClusters: [],
    };

  if (cachedShardAllocation && !force) return cachedShardAllocation;
  try {
    const response = await fetch(url, { headers }),
      json = (await response.json()) as any;

    if (response.status === 429) throw new Error("Ratelimited");
    if (response.status !== 200) throw new Error("Unexpected response: " + response.statusText + "\n" + response.body);

    body.total = json.shards;
    body.totalSessions = json.session_start_limit.total;
    body.remainingSessions = json.session_start_limit.remaining;
    body.resetsIn = json.session_start_limit.reset_after;
    body.maxConcurrent = json.session_start_limit.max_concurrency;
    // Calculate this cluster's range
    // The start is calculated by using the number shards received from the gateway and the number of clusters
    // The end is calculated by using the start plus the number of shards per cluster
    // If debug is enabled, simply give 1 shard per cluster
    if (isDebug) {
      body.thisCluster.start = clusterID;
      body.thisCluster.end = clusterID;
      body.thisCluster.count = 1;
      for (let i = 0; i < clusters; i++) {
        const range: ShardAllocationRange = {
          start: i,
          end: i + 1,
          count: 1,
        };
        body.allClusters.push(range);
      }
    } else {
      body.thisCluster.start = Math.floor(body.total / clusters) * clusterID;
      body.thisCluster.end =
        body.thisCluster.start + Math.floor(body.total / clusters) - 1;
      // If there is a remainder and this cluster is the last cluster, add them to the last cluster
      if (body.total % clusters > 0 && clusterID === clusters - 1)
        body.thisCluster.end += body.total % clusters;
      // calculate the total number of shards in this cluster
      body.thisCluster.count = body.thisCluster.end - body.thisCluster.start;
      // Calculate the range for each cluster
      for (let i = 0; i < clusters; i++) {
        const range: ShardAllocationRange = {
          start: Math.floor(body.total / clusters) * i,
          end: Math.floor(body.total / clusters) * (i + 1) - 1,
          count: -1,
        };
        // If there is a remainder, add them to the last cluster
        if (body.total % clusters > 0 && i === clusters - 1) {
          range.end += body.total % clusters;
        }
        range.count = range.end - range.start;
        body.allClusters.push(range);
      }
    }
    cachedShardAllocation = body;
    return body;
  } catch (error) {
    throw error;
  }
}
