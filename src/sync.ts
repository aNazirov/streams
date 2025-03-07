import { MongoClient } from "mongodb";
import Constants from "./constants";
import { SyncModes } from "./sync-modes";
import { Types } from "./types";
import { Utils } from "./utils";

// В данном кейсе можно нужно вывести в Utils, 
// но из за того что по сути данный метод должен быть уникальным,
// оставил дублирование из за простоты реализации
export async function cleanup(client: MongoClient) {
  console.log("Cleaning up...");

  await client.close();
  console.log("Mongo has been disconnected");

  console.log("Cleanup done");
}

async function main() {
  const client = new MongoClient(Constants.DB_URI);
  await client.connect();

  console.log("Mongo is connected");

  Utils.setupGracefulShutdown(async () => await cleanup(client));

  const db = client.db(Constants.DB_NAME);
  const customersCollection = db.collection<Types.Customer>(
    Constants.CustomerCollection,
  );
  const customersAnonymisedCollection = db.collection<Types.Customer>(
    Constants.CustomerAnonymisedCollection,
  );

  if (process.argv.includes(Constants.REINDEX_FLAG)) {
    await SyncModes.fullReindex(
      customersCollection,
      customersAnonymisedCollection,
    );
  } else {
    await SyncModes.realTime(
      customersCollection,
      customersAnonymisedCollection,
    );
  }

  await cleanup(client);
}

main();
