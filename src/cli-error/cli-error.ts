import { ErrorCause } from "./error-cause.ts";
import { definitionErrorMessage } from "./error-message/definition-error-message.ts";
import { internalErrorMessage } from "./error-message/internal-error-message.ts";
import { parseErrorMessage } from "./error-message/parse-error-message.ts";
import { validationErrorMessage } from "./error-message/validation-error-message.ts";

import type { CliErrorImpl, CliErrorOptionUnion } from "../types/error-types.ts";

export class CliError extends Error implements CliErrorImpl {
  readonly code;
  readonly cause;
  readonly context;

  constructor(options: CliErrorOptionUnion) {
    super(options.message ?? CliError.errorMessage(options));

    this.cause = options.cause;
    this.code = options.code;
    this.context = options.context;
  }

  static errorMessage(options: CliErrorOptionUnion): string {
    const defaultErrorMessage = "unknown error";

    if (options.cause === ErrorCause.Internal) {
      return internalErrorMessage(options) ?? defaultErrorMessage;
    }

    if (options.cause === ErrorCause.Parse) {
      return parseErrorMessage(options) ?? defaultErrorMessage;
    }

    if (options.cause === ErrorCause.Definition) {
      return definitionErrorMessage(options) ?? defaultErrorMessage;
    }

    if (options.cause === ErrorCause.Validation) {
      return validationErrorMessage(options) ?? defaultErrorMessage;
    }

    const executiveCheck: never = options;
    return executiveCheck;
  }
}
