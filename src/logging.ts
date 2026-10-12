import { configure } from "log4js";

export function configureLogging(): void {
    configure({
        appenders: {
            file: { type: "fileSync", filename: "logs/debug.log" },
        },
        categories: {
            default: { appenders: ["file"], level: "debug" },
        },
    });
}
