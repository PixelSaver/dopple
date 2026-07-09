export type CommandContext = {
    channel: string;
    threadTs: string;
    senderId: string;
    say: (message: any) => Promise<any>;
};
