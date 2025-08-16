/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as http from "../http.js";
import type * as shared_lib_constants from "../shared/lib/constants.js";
import type * as shared_lib_dateUtils from "../shared/lib/dateUtils.js";
import type * as shared_lib_idUtils from "../shared/lib/idUtils.js";
import type * as shared_lib_validation from "../shared/lib/validation.js";
import type * as shared_schemas_lectures from "../shared/schemas/lectures.js";
import type * as shared_schemas_operationLogs from "../shared/schemas/operationLogs.js";
import type * as shared_schemas_questionSets from "../shared/schemas/questionSets.js";
import type * as shared_schemas_responses from "../shared/schemas/responses.js";
import type * as shared_schemas_users from "../shared/schemas/users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  http: typeof http;
  "shared/lib/constants": typeof shared_lib_constants;
  "shared/lib/dateUtils": typeof shared_lib_dateUtils;
  "shared/lib/idUtils": typeof shared_lib_idUtils;
  "shared/lib/validation": typeof shared_lib_validation;
  "shared/schemas/lectures": typeof shared_schemas_lectures;
  "shared/schemas/operationLogs": typeof shared_schemas_operationLogs;
  "shared/schemas/questionSets": typeof shared_schemas_questionSets;
  "shared/schemas/responses": typeof shared_schemas_responses;
  "shared/schemas/users": typeof shared_schemas_users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
