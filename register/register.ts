import { readFile, writeFile } from "node:fs/promises";

const USERS_FILE = "./data/users.json";

interface User {
    id: string;
    reminders: Reminder[],
}
interface Reminder {
    date: string,
    message: string,
}

export async function loadUsers(): Promise<User[]> {
    return JSON.parse(
        await readFile(USERS_FILE, "utf8")
    ) as User[];
}
export async function saveUsers(users: User[]): Promise<void> {
    await writeFile(
        USERS_FILE,
        JSON.stringify(users, null, 2)
    );
}

export async function register(user_id: string): Promise<string> {
    const text = await readFile("./data/users.json", "utf8");
    const users = JSON.parse(text) as User[];
    if (users.find(u => u.id === user_id)) {
        console.log("Already registered")
        return 'You have already registered yourself for using this bot, <@' + user_id + '>';
    }
    users.push({ id: user_id, reminders: [] });
    await writeFile(
        USERS_FILE,
        JSON.stringify(users, null, 2)
    );
    return 'You have successfully registered yourself for using this bot, <@' + user_id + '>\nIf you didn\'t mean to register, type in `!deregister`. Also, please dm <@' + process.env.ME_ID + '> if you have any questions. Thanks!';
}
export async function is_registered(user_id: string): Promise<boolean> {
    const users = await loadUsers();
    return users.some(u => u.id === user_id);
}
export async function deregister(user_id: string): Promise<string> {
    if (!is_registered(user_id)) {return "You weren't registered to begin with, <@" + user_id + ">"}
    const users = await loadUsers();
    const filteredUsers = users.filter(u => u.id !== user_id);
    await saveUsers(filteredUsers);
    return 'You have successfully deregistered yourself from using this bot, <@' + user_id + '>';
}
async function getUser(user_id: string): Promise<User | undefined> {
    const users = await loadUsers();
    return users.find(u => u.id === user_id);
}
export async function setUserReminder(user_id: string, reminder: Reminder) { 
    const users = await loadUsers();
    const user = users.find(u => u.id === user_id);
    if (!user || !user.reminders) { return false; }
    user.reminders.push(reminder);
    
    await saveUsers(users);
}