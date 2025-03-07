import { Collection, ReplaceOneModel } from "mongodb";
import Constants from "../constants";
import { Entities } from "../entities";
import { Types } from "../types";

export async function fullReindexEventBased(
  customersCollection: Collection<Types.Customer>,
  customersAnonymizedCollection: Collection<Types.Customer>,
) {
  const stream = customersCollection.find({}).stream();

  let batch: { replaceOne: ReplaceOneModel<Types.Customer> }[] = [];

  stream.on("data", async (rawData: Types.Customer) => {
    const customer = new Entities.Customer(rawData);

    batch.push({
      replaceOne: {
        filter: { _id: customer._id },
        replacement: customer.getAnonymised(),
        upsert: true,
      },
    });

    if (batch.length === Constants.BATCH_LIMIT) {
      console.log("Batch processing started");
      stream.pause();

      await customersAnonymizedCollection.bulkWrite(batch);
      batch = [];

      stream.resume();
      console.log("Batch processing finished");
    }
  });

  stream.on("end", async () => {
    if (batch.length > 0) {
      console.log("Batch processing started");

      await customersAnonymizedCollection.bulkWrite(batch);

      batch = [];
      stream.resume();

      console.log("Batch processing finished");
    }

    console.log("Stream finished successfully");
    process.exit();
  });

  stream.on("error", (err) => {
    console.error("Stream error:", err);
    process.exit(1);
  });
}
