import { DbClient } from "./db/db.ts";
import { IssueReportsModel } from "./db/issue-report.model.ts";
import { logger } from "./logger.ts";
import { Server } from "./server.ts";
import { errorToString } from "./utils.ts";
import { QuestionModel } from "./db/question.model.ts";

try {
    await logger.init();
    await DbClient.init();
    // UserModel.sync();
    IssueReportsModel.sync();
    QuestionModel.sync();
    Server.run();
} catch (error) {
    logger.error(errorToString(error));
}