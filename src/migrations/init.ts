import { MongoClient } from "mongodb";
import Constants from "../constants";
import { Utils } from "../utils";

// В данном кейсе можно нужно вывести в Utils, 
// но из за того что по сути данный метод должен быть уникальным,
// оставил дублирование из за простоты реализации
export async function cleanup(client: MongoClient) {
  console.log("Cleaning up...");

  await client.close();
  console.log("Mongo has been disconnected");

  console.log("Cleanup done");
}

async function init() {
  const client = new MongoClient(Constants.DB_URI);
  await client.connect();

  console.log("Mongo is connected");

  Utils.setupGracefulShutdown(async () => await cleanup(client));

  const db = client.db(Constants.DB_NAME);

  const collections = await db.listCollections().toArray();
  const existingCollections = collections.map((col) => col.name);

  if (!existingCollections.includes(Constants.CustomerCollection)) {
    await db.createCollection(Constants.CustomerCollection);
  }

  if (!existingCollections.includes(Constants.CustomerAnonymisedCollection)) {
    await db.createCollection(Constants.CustomerAnonymisedCollection);
  }

  console.log("Migrations have been applied");
  await cleanup(client);
}

init();
