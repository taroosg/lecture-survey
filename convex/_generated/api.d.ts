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
import type * as api_admin from "../api/admin.js";
import type * as api_lectures from "../api/lectures.js";
import type * as api_responses from "../api/responses.js";
import type * as api_users from "../api/users.js";
import type * as auth from "../auth.js";
import type * as http from "../http.js";
import type * as mutations_index from "../mutations/index.js";
import type * as mutations_lectures_createLecture from "../mutations/lectures/createLecture.js";
import type * as mutations_lectures_deleteLecture from "../mutations/lectures/deleteLecture.js";
import type * as mutations_lectures_index from "../mutations/lectures/index.js";
import type * as mutations_lectures_submitResponse from "../mutations/lectures/submitResponse.js";
import type * as mutations_lectures_updateLecture from "../mutations/lectures/updateLecture.js";
import type * as mutations_users_index from "../mutations/users/index.js";
import type * as mutations_users_updateUserProfile from "../mutations/users/updateUserProfile.js";
import type * as mutations_users_updateUserRole from "../mutations/users/updateUserRole.js";
import type * as queries_index from "../queries/index.js";
import type * as queries_lectures_getLecture from "../queries/lectures/getLecture.js";
import type * as queries_lectures_getLectures from "../queries/lectures/getLectures.js";
import type * as queries_lectures_index from "../queries/lectures/index.js";
import type * as queries_responses_checkSurveyAvailable from "../queries/responses/checkSurveyAvailable.js";
import type * as queries_responses_index from "../queries/responses/index.js";
import type * as queries_users_getAdminUsers from "../queries/users/getAdminUsers.js";
import type * as queries_users_getCurrentUser from "../queries/users/getCurrentUser.js";
import type * as queries_users_getUser from "../queries/users/getUser.js";
import type * as queries_users_getUserProfile from "../queries/users/getUserProfile.js";
import type * as queries_users_getUsers from "../queries/users/getUsers.js";
import type * as queries_users_index from "../queries/users/index.js";
import type * as services_lectures_validators_lectureValidator from "../services/lectures/validators/lectureValidator.js";
import type * as services_users_helpers_userHelpers from "../services/users/helpers/userHelpers.js";
import type * as services_users_validators_userValidator from "../services/users/validators/userValidator.js";
import type * as shared_helpers_authHelpers from "../shared/helpers/authHelpers.js";
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
  "api/admin": typeof api_admin;
  "api/lectures": typeof api_lectures;
  "api/responses": typeof api_responses;
  "api/users": typeof api_users;
  auth: typeof auth;
  http: typeof http;
  "mutations/index": typeof mutations_index;
  "mutations/lectures/createLecture": typeof mutations_lectures_createLecture;
  "mutations/lectures/deleteLecture": typeof mutations_lectures_deleteLecture;
  "mutations/lectures/index": typeof mutations_lectures_index;
  "mutations/lectures/submitResponse": typeof mutations_lectures_submitResponse;
  "mutations/lectures/updateLecture": typeof mutations_lectures_updateLecture;
  "mutations/users/index": typeof mutations_users_index;
  "mutations/users/updateUserProfile": typeof mutations_users_updateUserProfile;
  "mutations/users/updateUserRole": typeof mutations_users_updateUserRole;
  "queries/index": typeof queries_index;
  "queries/lectures/getLecture": typeof queries_lectures_getLecture;
  "queries/lectures/getLectures": typeof queries_lectures_getLectures;
  "queries/lectures/index": typeof queries_lectures_index;
  "queries/responses/checkSurveyAvailable": typeof queries_responses_checkSurveyAvailable;
  "queries/responses/index": typeof queries_responses_index;
  "queries/users/getAdminUsers": typeof queries_users_getAdminUsers;
  "queries/users/getCurrentUser": typeof queries_users_getCurrentUser;
  "queries/users/getUser": typeof queries_users_getUser;
  "queries/users/getUserProfile": typeof queries_users_getUserProfile;
  "queries/users/getUsers": typeof queries_users_getUsers;
  "queries/users/index": typeof queries_users_index;
  "services/lectures/validators/lectureValidator": typeof services_lectures_validators_lectureValidator;
  "services/users/helpers/userHelpers": typeof services_users_helpers_userHelpers;
  "services/users/validators/userValidator": typeof services_users_validators_userValidator;
  "shared/helpers/authHelpers": typeof shared_helpers_authHelpers;
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
