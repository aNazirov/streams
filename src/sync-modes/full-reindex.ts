import { Collection, ReplaceOneModel } from "mongodb";
import { pipeline } from "stream/promises";
import Constants from "../constants";
import { Entities } from "../entities";
import { Types } from "../types";
import { Utils } from "../utils";

export async function fullReindex(
  customersCollection: Collection<Types.Customer>,
  customersAnonymizedCollection: Collection<Types.Customer>,
) {
  console.log("Full reindex started");

  const read = customersCollection.find({}).sort({ _id: 1 }).stream();

  const transformStrategy = (data: Types.Customer) => {
    const customer = new Entities.Customer(data);

    return {
      replaceOne: {
        filter: { _id: customer._id },
        replacement: customer.getAnonymised(),
        upsert: true,
      },
    };
  };
  const transform = Utils.createBatcher<
    Types.Customer,
    { replaceOne: ReplaceOneModel<Types.Customer> }
  >(Constants.BATCH_LIMIT, transformStrategy);

  const writeStrategy = async (
    data: { replaceOne: ReplaceOneModel<Types.Customer> }[],
  ) => {
    console.log("Batch processing started");

    await customersAnonymizedCollection.bulkWrite(data);

    console.log("Batch processing finished");
  };
  const write = Utils.createWritableStream<
    { replaceOne: ReplaceOneModel<Types.Customer> }[],
    void
  >(writeStrategy);

  try {
    await pipeline(read, transform, write);

    console.log("Reindex finished successfully");
  } catch (error) {
    console.error("Reindex error:", error);
    process.exit(1);
  }
}
