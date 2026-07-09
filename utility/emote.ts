import { readFile } from "fs/promises";
const EMOTES_FILE = "data/emotes.txt";

async function getEmotes(): Promise<string[]> {
    const content = await readFile(EMOTES_FILE, "utf-8");
    return content.split("\n").filter(Boolean);
}
export async function getRandomEmote(): Promise<string> {
    const emotes = await getEmotes();
    if (emotes.length === 0) return "";
    return emotes[Math.floor(Math.random() * emotes.length)] ?? "";
}