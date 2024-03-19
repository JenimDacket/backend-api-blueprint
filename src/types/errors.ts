export type ApiErrorResponse = {
  message: string;
  details?: { [key: string]: { message: string; value?: string } };
};
