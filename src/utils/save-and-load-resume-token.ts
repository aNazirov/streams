import fs from "fs/promises";

export async function saveLastResumeToken(token: string) {
  await fs.writeFile("./resume-token.text", token);
}

export async function loadLastResumeToken(): Promise<
  { _data: string } | undefined
> {
  try {
    const token = await fs.readFile("./resume-token.text", "utf-8");

    return { _data: token };
  } catch (e) {
    return undefined;
  }
}
