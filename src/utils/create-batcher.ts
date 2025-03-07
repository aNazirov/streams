import { Transform } from "stream";

export function createBatcher<Data, StrategyResult>(
  size: number,
  transformStrategy: (data: Data) => StrategyResult,
  timeLimit?: number,
) {
  let batch: StrategyResult[] = [];
  let timer: NodeJS.Timeout | null = null;

  function startTimer(push: (data: StrategyResult[]) => void) {
    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      console.log("Timeout");

      if (batch.length > 0) {
        push(batch);
        batch = [];
      }
    }, timeLimit);
  }

  function clearTimer() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  return new Transform({
    objectMode: true,
    highWaterMark: size,
    transform(chunk: Data, encoding, callback) {
      batch.push(transformStrategy(chunk));

      if (timeLimit && batch.length === 1) {
        startTimer((batchToPush) => {
          this.push(batchToPush);
          clearTimer();
        });
      }

      if (batch.length === size) {
        if (timer) clearTimeout(timer);

        const canContinue = this.push(batch);
        batch = [];

        if (!canContinue) {
          console.log("Batcher paused - writable buffer full");
        }
      }

      callback(null);
    },
    flush(callback) {
      if (batch.length > 0) {
        if (timer) clearTimeout(timer);

        const canContinue = this.push(batch);
        batch = [];

        if (!canContinue) {
          console.log("Batcher paused - writable buffer full");
        }
      }

      callback(null);
    },
  });
}
