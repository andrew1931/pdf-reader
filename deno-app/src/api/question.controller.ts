import { QuestionModel } from "../db/question.model.ts";

export const QuestionController = (() => {
   
   return {
      async addQuestion(req: Request) {
         const { question, askedBy } = await req.json();
         await QuestionModel.save({ question, askedBy });
      }
   }
})();