import { NotAuthorizedError } from "./api/user.controller.ts";
import { config } from "./config.ts";
import { logger } from "./logger.ts";
import { errorToString, steamResponse } from "./utils.ts";

const normalizePathname = (initialPath: string) => {
    let pathname = initialPath;
    if (pathname.endsWith("/")) {
        pathname = pathname.slice(0, pathname.length - 1);
    }
    if (pathname.startsWith("/")) {
        pathname = pathname.slice(1);
    }
    return pathname;
}

export type StreamHandler = (req: Request, controller: ReadableStreamDefaultController) => Promise<unknown>;

type RouterResponse = {
    type: "dir" | "file" | "json" | "stream";
    status: number;
    data: unknown;
    errorMessage: string;
    urlRoot?: string;
}

export const Router = (() => {
    const assetsRoutes: Set<string> = new Set();
    const apiRoutes = new Map();
    const streamRoutes = new Map();

    const isLocalResource = (pathname: string): boolean => {
        return (
            (!pathname.includes('http') && !pathname.includes('https')) &&
            (
                pathname.endsWith(".js") ||
                pathname.endsWith(".css") ||
                pathname.endsWith(".png") ||
                pathname.endsWith(".json") ||
                pathname.endsWith(".txt")
            )
        );
    };

    const getErrorCode = (error: unknown): number => {
        return error instanceof NotAuthorizedError ? 401 :  400;
    };

    return {
        asset(path: string): void {
            assetsRoutes.add(path);
        },
        stream(path: string, handler: StreamHandler): void {
            streamRoutes.set(path, handler);
        },
        get(path: string, handler: (req: Request) => Promise<unknown>): void {
            apiRoutes.set(path, handler);
        },
        post(path: string, handler: (req: Request) => Promise<unknown>): void {
            apiRoutes.set(path, handler);
        },
        async handle(req: Request): Promise<RouterResponse> {
            const url = new URL(req.url);
            const pathname = normalizePathname(url.pathname);

            logger.debug("path:", pathname);
            for (const route of assetsRoutes) {
                if (pathname.startsWith(route)) {
                    return {
                        type: "dir",
                        status: 200,
                        data: route,
                        urlRoot: route,
                        errorMessage: "",
                    }
                }
            }

            if (streamRoutes.has(pathname)) {
                try {
                    const handler = await streamRoutes.get(pathname) as StreamHandler;
                    const data = new ReadableStream({
                        start(controller) {
                            handler(req, controller)
                            .then((res) => {
                                try {
                                    controller.enqueue(
                                        steamResponse(res, 200)
                                    );
                                    controller.close();
                                } catch (error) {
                                    throw error;
                                }
                            })
                            .catch((error) => {
                                try {
                                    controller.enqueue(
                                        steamResponse(errorToString(error), 400)
                                    );
                                    controller.close();
                                } catch (error) {
                                    logger.error(errorToString(error));
                                }
                            })
                        },
                        cancel() {}
                    });

                    return {
                        type: "stream",
                        status: 200,
                        data,
                        errorMessage: ""
                    }
                } catch (error: unknown) {
                    const strError = errorToString(error);
                    logger.error(strError);
                    return {
                        type: "stream",
                        status: getErrorCode(error),
                        data: null,
                        errorMessage: strError
                    }
                }
            }

            if (apiRoutes.has(pathname)) {
                try {
                    const data = await apiRoutes.get(pathname)(req);
                    return {
                        type: "json",
                        status: 200,
                        data,
                        errorMessage: ""
                    }
                } catch (error: unknown) {
                    const strError = errorToString(error);
                    logger.error(strError);
                    return {
                        type: "json",
                        status: getErrorCode(error),
                        data: null,
                        errorMessage: strError
                    }
                }
            }

            // server spa as fallback
            const targetFile = isLocalResource(pathname) ? pathname : "index.html";
            return {
                type: "file",
                status: 200,
                data: config.clientAppDir + targetFile,
                errorMessage: ""
            }
        }
    }
})();