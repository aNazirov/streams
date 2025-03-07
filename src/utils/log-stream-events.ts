export function subscribeToAllStreamEvents(
  name: string,
  stream:
    | NodeJS.ReadWriteStream
    | NodeJS.ReadableStream
    | NodeJS.WritableStream,
  events: string[],
) {
  for (const event of events) {
    stream.on(event, () => console.log(`[${name}] event: ${event}`));
  }
}

export function unsubscribeFromAllStreamEvents(
  stream:
    | NodeJS.ReadWriteStream
    | NodeJS.ReadableStream
    | NodeJS.WritableStream,
) {
  stream.removeAllListeners();
}
