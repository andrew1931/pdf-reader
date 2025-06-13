import { errorToString } from '../core/utils';
import { HttpClient } from './http-client';
import type {
   AuthResponse,
   AskQuestionResponse,
   ReportIssueResponse,
   UserResponse,
   EmailIsAllowedResponse,
} from './types';

export const REQUEST_STATUS = {
   OPEN: 0,
   APPROVED: 1,
   REJECTED: 2,
};

export const USER_ROLES = {
   ADMIN: 'ADMIN',
   USER: 'USER',
   ANONYMOUS: 'ANONYMOUS',
};

export const ApiClient = (() => {
   const httpClient = HttpClient(API_URL + '/api');

   return {
      logError(path: string, message: unknown) {
         return httpClient.post('log/client-error', {
            message: path + errorToString(message),
         });
      },
      askQuestion(askedBy: string, question: string): Promise<AskQuestionResponse> {
         return httpClient.post('question', { askedBy, question });
      },
      reportIssue(description: string): Promise<ReportIssueResponse> {
         return httpClient.post('reports/issue', { description });
      },
      getVersion(): Promise<{ buildHash: string }> {
         return httpClient.getLocal('/version.json');
      },
      getPolicy(): Promise<string> {
         return httpClient.getLocal('/policy.txt');
      },

      // unused temporally
      getUser(): Promise<UserResponse> {
         return httpClient.get('user');
      },
      emailExists(email: string): Promise<EmailIsAllowedResponse> {
         return httpClient.post('check-email', { email });
      },
      signIn(email: string, password: string): Promise<AuthResponse> {
         return httpClient.post('sign-in', { email, password });
      },
      signUp(email: string, password: string, code: string): Promise<AuthResponse> {
         return httpClient.post('sign-up', { email, password, code });
      },
      resetPassword(email: string, password: string, code: string): Promise<AuthResponse> {
         return httpClient.post('reset-password', { email, password, code });
      },
   };
})();
