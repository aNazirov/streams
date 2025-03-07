import { Collection, MongoClient } from "mongodb";
import Constants from "./constants";
import { Entities } from "./entities";
import { Types } from "./types";
import { Utils } from "./utils";

async function generateUsersAndSave(
  customersCollection: Collection<Types.Customer>,
) {
  try {
    const count = Math.floor(Math.random() * 10) + 1;

    const customers = Utils.getRandomCustomers(count);

    console.log(`New ${count} customers are generated`);

    const data = customers.map((customers) => ({
      insertOne: { document: new Entities.Customer(customers) },
    }));

    console.log(`Customers are saved`);

    await customersCollection.bulkWrite(data);
  } catch (error) {
    console.error("Generate and save user error:", error);
    process.exit(1);
  }
}

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

  while (true) {
    await Utils.wait(200);

    generateUsersAndSave(customersCollection);
  }
}

main();
