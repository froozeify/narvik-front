import type { SubmissionErrors } from "../types/error";

export class SubmissionError extends Error {
  private readonly _errors: SubmissionErrors;

  constructor(errors: SubmissionErrors) {
    super(errors['_error']);
    this._errors = errors;
  }

  public get errors(): SubmissionErrors {
    return this._errors;
  }
}
