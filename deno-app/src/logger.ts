import { Logger } from "@deno-library/logger";

export const logger = (() => {

    const fileLogger = new Logger();

    const message = (values: string[]): string => values.join(" ");

    return {
        async init() {
            await fileLogger.initFileLogger("./log", {
                maxBytes: 10 * 1024,
                maxBackupCount: 10,
            });
            fileLogger.disableConsole();
        },
        info(...values: string[]) {
            fileLogger.info(message(values)); 
        },
        error(...values: string[]) {
            fileLogger.error(message(values));
        },
        debug(...values: string[]) {
            console.log(message(values));
        }
    }
})();