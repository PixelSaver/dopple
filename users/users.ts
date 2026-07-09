import { readFile, writeFile, rename } from "node:fs/promises";
import { WebClient } from "@slack/web-api";

const USERS_FILE = "./data/users.json";
let saveQueue = Promise.resolve();

interface User {
    name: string;
    id: string;
    reminders: Reminder[];
    pester: boolean,
}
function migrateUser(user: any): User {
    return {
        name: user.name ?? "",
        id: user.id,
        reminders: user.reminders ?? [] as Reminder[],
        pester: user.pester ?? false,
    };
}
interface Reminder {
    date: string;
    message: string;
}

export async function loadUsers(): Promise<User[]> {
    const data = await readFile(USERS_FILE, "utf8")
    const users = JSON.parse(data);
    const migrated = users.map(migrateUser) as User[];
    return migrated;
}
export async function saveUsers(users: User[]): Promise<void> {
    saveQueue = saveQueue.then(async () => {
        const data = JSON.stringify(users, null, 2);
        await writeFile(`${USERS_FILE}.tmp`, data);
        await rename(`${USERS_FILE}.tmp`, USERS_FILE);
    });
    return saveQueue;
}

export async function register(name: string, user_id: string): Promise<string> {
    const users = await loadUsers();
    if (users.find((u) => u.id === user_id)) {
        console.log("Already registered");
        return (
            `You have already registered yourself for using this bot, <@${user_id}>`
        );
    }
    users.push(migrateUser({ name: name, id: user_id }));
    await saveUsers(users);
    return (
        "You have successfully registered yourself for using this bot, <@" +
        user_id +
        ">\nIf you didn't mean to register, type in `!deregister`. Also, please dm <@" +
        process.env.ME_ID +
        "> if you have any questions. Thanks!"
    );
}
export async function isRegistered(user_id: string): Promise<boolean> {
    const users = await loadUsers();
    return users.some((u) => u.id === user_id);
}
export async function deregister(user_id: string): Promise<string> {
    if (!isRegistered(user_id)) {
        return "You weren't registered to begin with, <@" + user_id + ">";
    }
    const users = await loadUsers();
    const filteredUsers = users.filter((u) => u.id !== user_id);
    await saveUsers(filteredUsers);
    return (
        "You have successfully deregistered yourself from using this bot, <@" +
        user_id +
        ">"
    );
}
async function getUser(user_id: string): Promise<User | undefined> {
    const users = await loadUsers();
    return users.find((u) => u.id === user_id);
}
export async function setUserReminder(user_id: string, reminder: Reminder) {
    const users = await loadUsers();
    const user = users.find((u) => u.id === user_id);
    if (!user || !user.reminders) {
        return false;
    }
    console.log(`user: ${user.id}, reminders: ${user?.reminders}`);
    user.reminders.push(reminder);

    await saveUsers(users);
    return true;
}
export async function consumeUserReminder(user_id: string, date: string) {
    const users = await loadUsers();
    const user = users.find((u) => u.id === user_id);
    if (!user || !user.reminders) {
        return false;
    }
    user.reminders = user.reminders.filter((r) => r.date !== date);
    await saveUsers(users);
    return true;
}

export async function checkReminders(client: WebClient) {
    // console.log("checking reminders");
    const now = new Date();
    const users = await loadUsers();
    for (const user of users) {
        for (const reminder of user.reminders ?? []) {
            if (new Date(reminder.date) <= now) {
                const dm = await client.conversations.open({ users: user.id });
                if (!dm.channel?.id) return;
                await client.chat.postMessage({
                    channel: dm.channel.id,
                    text: reminder.message,
                });
                await consumeUserReminder(user.id, reminder.date);
            }
        }
    }
}
export async function getUserPester(user_id: string): Promise<boolean> {
    const user = await getUser(user_id);
    return user?.pester ?? false;
}
