import { config } from "./config.ts";
import { serveDir, serveFile } from "@std/http/file-server";
import { Router } from "./router.ts";
import { IssueReportController } from "./api/issue-report.controller.ts";
import { QuestionController } from "./api/question.controller.ts";
import { logger } from "./logger.ts";

export const Server = (() => {
    // Router.post("api/sign-in", UserController.signIn);
    // Router.post("api/check-email", UserController.checkEmailAndSendCode);
    // Router.post("api/sign-up", UserController.signUp);
    // Router.post("api/reset-password", UserController.resetPassword);
    // Router.get("api/user", UserController.getUser);

    Router.post("api/reports/issue", IssueReportController.addReport);
    Router.post("api/question", QuestionController.addQuestion);
    Router.post("api/log/client-error", async (req: Request) => {
        const { message } = await req.json();
        logger.error("[client error]", message);
    });

    return {
        run() {
            Deno.serve({ port: config.port, hostname: config.host }, (req) => {
                return Router.handle(req)
                .then((response) => {
                if (response.type === "file") {
                    return serveFile(req, response.data as string);
                }

                if (response.type === "dir") {
                    return serveDir(req, {
                        fsRoot: response.data as string,
                        urlRoot: response.urlRoot || ''
                    });
                }

                if (response.type === "stream") {
                    return new Response(response.data as ReadableStream, {
                        headers: {
                            "content-type": "text/plain",
                            "x-content-type-options": "nosniff",
                        },
                    });
                }

                return Response.json(response)
                })
                .catch(() => {
                return Response.json({
                    status: 500,
                    data: "unknown error"
                })
                });
            });
        }
    }
})();
