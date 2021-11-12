import PrefixDB from './DB/Prefixes';
import ECH from 'eris-command-handler';
import { Op } from 'sequelize';
import { sequelize } from './DB';

let checkNewPrefixesLastQuery = -1;

let newPrefixInterval: NodeJS.Timer, deletedPrefixInterval: NodeJS.Timer;

export interface PrefixData {
  id: string;
  prefix: string;
}

async function checkNewPrefixes(client: ECH.CommandClient) {
  let res = await PrefixDB.findAll({
    where: {
      createdAt: {
        [Op.gt]: checkNewPrefixesLastQuery > 0 ? checkNewPrefixesLastQuery : 0
      }
    }
  });

  checkNewPrefixesLastQuery = Date.now();

  res.forEach(v => {
    client.guildPrefixes[v.serverID] = v.prefix;
  });
}

async function checkDeletedPrefixes(client: ECH.CommandClient) {
  let res = await sequelize.query(
    `SELECT * FROM unnest('{${Object.keys(client.guildPrefixes).join(
      ','
    )}}'::varchar[]) id
EXCEPT ALL
SELECT "serverID" from "Prefixes";`
  );

  res[0].forEach((v: { id: string }) => {
    delete client.guildPrefixes[v.id];
  });
}

export async function startPrefixManager(client: ECH.CommandClient) {
  newPrefixInterval = setInterval(() => {
    checkNewPrefixes(client);
  }, 10000);

  setTimeout(() => {
    deletedPrefixInterval = setInterval(() => {
      checkDeletedPrefixes(client);
    }, 10000);
  }, 5000);
}

export function stopPrefixManager() {
  clearInterval(newPrefixInterval);
  clearInterval(deletedPrefixInterval);
}

export async function updatePrefix(
  client: ECH.CommandClient,
  serverID: string,
  prefix: string
): Promise<PrefixData> {
  let res = await PrefixDB.findOrCreate({
    where: {
      serverID
    },
    defaults: {
      serverID,
      prefix
    }
  });
  if (res[1]) {
    return { id: serverID, prefix };
  } else {
    if (prefix === client.commandOptions.prefix || prefix === '' || !prefix) {
      await res[0].destroy();
      return { id: serverID, prefix: client.commandOptions.prefix as string };
    } else {
      let ures = await res[0].update({ prefix });
      return { id: ures.serverID, prefix: ures.prefix };
    }
  }
}

export async function removePrefix(serverID: string): Promise<void> {
  let res = await PrefixDB.findOne({
    where: {
      serverID
    }
  });

  if (!res) {
    return;
  } else {
    await res.destroy();
    return;
  }
}
