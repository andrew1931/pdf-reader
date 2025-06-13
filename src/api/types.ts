type ApiResponse = {
   status: number;
};

export type UserResponse = ApiResponse & {
   data: {
      id: number;
      email: string;
      role: string;
      createdAt: string;
      updatedAt: string;
   } | null;
   errorMessage: string;
};

export type EmailIsAllowedResponse = ApiResponse & {
   data: boolean;
   errorMessage: string;
};

export type AuthResponse = ApiResponse & {
   data: {
      token: string;
      user: UserResponse['data'];
   };
   errorMessage: string;
};

export type AskQuestionResponse = ApiResponse & {
   data: void;
   errorMessage: string;
};

export type ReportIssueResponse = ApiResponse & {
   data: void;
   errorMessage: string;
};
