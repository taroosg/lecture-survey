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
import type * as domains_lectures___fixtures___lecture_test_data from "../domains/lectures/__fixtures__/lecture-test-data.js";
import type * as domains_lectures___fixtures___mock_data from "../domains/lectures/__fixtures__/mock-data.js";
import type * as domains_lectures_api_mutations from "../domains/lectures/api/mutations.js";
import type * as domains_lectures_api_queries from "../domains/lectures/api/queries.js";
import type * as domains_lectures_repositories_lectureRepository from "../domains/lectures/repositories/lectureRepository.js";
import type * as domains_lectures_services_lectureService from "../domains/lectures/services/lectureService.js";
import type * as domains_lectures_services_lectureValidator from "../domains/lectures/services/lectureValidator.js";
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
  "domains/lectures/__fixtures__/lecture-test-data": typeof domains_lectures___fixtures___lecture_test_data;
  "domains/lectures/__fixtures__/mock-data": typeof domains_lectures___fixtures___mock_data;
  "domains/lectures/api/mutations": typeof domains_lectures_api_mutations;
  "domains/lectures/api/queries": typeof domains_lectures_api_queries;
  "domains/lectures/repositories/lectureRepository": typeof domains_lectures_repositories_lectureRepository;
  "domains/lectures/services/lectureService": typeof domains_lectures_services_lectureService;
  "domains/lectures/services/lectureValidator": typeof domains_lectures_services_lectureValidator;
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
