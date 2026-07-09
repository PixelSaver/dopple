import { readFile } from "fs/promises";
import { parse as yamlParse } from "yaml";
const EMOTES_FILE = "data/emotes.yaml";

interface Emote {
    emote: string;
    tags: string[];
}

async function loadEmotes(): Promise<Emote[]> {
    const content = await readFile(EMOTES_FILE, "utf-8");
    return yamlParse(content) as Emote[];
}
async function queryEmotes(tags: string[]): Promise<Emote[]> {
    const emotes = await loadEmotes();
    return emotes.filter(emote => tags.every(tag => emote.tags.includes(tag)));
}
export async function getRandomEmote(tags: string[]): Promise<string> {
    if (tags.length === 0) { tags = ["regular"] };
    const filtered = await queryEmotes(tags);
    if (filtered.length === 0) return "";
    const emote = filtered[Math.floor(Math.random() * filtered.length)]?.emote ?? "";
    return `${emote}`;
}