import { IssueReportsModel } from "../db/issue-report.model.ts";
import { verifyJWT } from "../jwt.ts";

export const IssueReportController = (() => {
   
   return {
      async addReport(req: Request) {
         const { description } = await req.json();
         const jwt = await verifyJWT(req);
         await IssueReportsModel.save({ description, addedBy: jwt.userId });
      }
   }
})();