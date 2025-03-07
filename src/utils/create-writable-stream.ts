import { Writable } from "stream";

export function createWritableStream<Data, StrategyResult>(
  writeStrategy: (data: Data) => Promise<StrategyResult>,
) {
  return new Writable({
    objectMode: true,
    // В данном случае поставлен 1 из за того что мы получаем в chunk массив с 1000 элементов (Не всегда, но это ожидаемый кейс)
    // лучшее решение это сделать это поле динамическим, но я посчитал это лишним, так как в отличии от Transform мне нужно смотреть сколько элементов я по итогу получаю в chunk из за наличия ассинхронной части в записи, 
    // чтобы не было такого что я в моменте храню в буфере слишком много данных
    highWaterMark: 1,
    write(chunk: Data, encoding, callback) {
      writeStrategy(chunk)
        .then(() => callback(null))
        .catch((error) => callback(error));
    },
    final(callback) {
      console.log("All data written");
      callback(null);
    },
  });
}
