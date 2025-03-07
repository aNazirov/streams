import {
  ChangeStreamDocument,
  Collection,
  Document,
  ReplaceOneModel,
} from "mongodb";
import { pipeline } from "stream/promises";
import Constants from "../constants";
import { Entities } from "../entities";
import { Types } from "../types";
import { Utils } from "../utils";

type CustomChangeStreamDocument<TSchema extends Document> =
  ChangeStreamDocument<TSchema> & {
    _id: { _data: string };
    operationType: "insert" | "update" | "replace";
  };
type CustomReplaceOneBulkWriteOperation<TSchema extends Document> = {
  replaceOne: ReplaceOneModel<TSchema>;
  resumeToken: string;
};

export async function realTime(
  customersCollection: Collection<Types.Customer>,
  customersAnonymizedCollection: Collection<Types.Customer>,
) {
  console.log("Real time sync started");

  const resumeToken = await Utils.loadLastResumeToken();
  const changeStreamPipeline = [
    { $match: { operationType: { $in: ["insert", "update", "replace"] } } },
  ];

  const changeStream = customersCollection.watch(changeStreamPipeline, {
    fullDocument: "updateLookup",
    resumeAfter: resumeToken,
  });

  const transformStrategy = (
    data: CustomChangeStreamDocument<Types.Customer>,
  ) => {
    // Так как в данном кейсе replaceOne отвечает всем требованиям для обработки
    // решил отказатся от индивидуальных обработчиков для каждого ивента в пользу читабельности
    const customer = new Entities.Customer(data.fullDocument!);

    return {
      replaceOne: {
        filter: { _id: customer._id },
        replacement: customer.getAnonymised(),
        upsert: true,
      },
      resumeToken: data._id._data,
    };
  };
  const transform = Utils.createBatcher<
    CustomChangeStreamDocument<Types.Customer>,
    CustomReplaceOneBulkWriteOperation<Types.Customer>
  >(Constants.BATCH_LIMIT, transformStrategy, 1000);

  const writeStrategy = async (
    data: CustomReplaceOneBulkWriteOperation<Types.Customer>[],
  ) => {
    console.log("Batch processing started");

    await customersAnonymizedCollection.bulkWrite(data);
    const lastToken = data[data.length - 1]?.resumeToken;

    if (lastToken) {
      await Utils.saveLastResumeToken(lastToken);
    }

    console.log("Batch processing finished");
  };
  const write = Utils.createWritableStream<
    CustomReplaceOneBulkWriteOperation<Types.Customer>[],
    void
  >(writeStrategy);

  try {
    await pipeline(changeStream, transform, write);

    console.log("Sync finished successfully");
  } catch (error) {
    console.error("Sync error:", error);
    process.exit(1);
  }
}
