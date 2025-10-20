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
import type * as actions_analysis_closeLectureOrchestrator from "../actions/analysis/closeLectureOrchestrator.js";
import type * as actions_analysis_executeCompleteAnalysis from "../actions/analysis/executeCompleteAnalysis.js";
import type * as actions_analysis_helpers from "../actions/analysis/helpers.js";
import type * as actions_analysis_index from "../actions/analysis/index.js";
import type * as api_admin from "../api/admin.js";
import type * as api_analysisResults from "../api/analysisResults.js";
import type * as api_lectures from "../api/lectures.js";
import type * as api_responses from "../api/responses.js";
import type * as api_users from "../api/users.js";
import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as mutations_analysis_createResultSet from "../mutations/analysis/createResultSet.js";
import type * as mutations_analysis_index from "../mutations/analysis/index.js";
import type * as mutations_analysis_saveAnalysisResults from "../mutations/analysis/saveAnalysisResults.js";
import type * as mutations_analysis_updateLectureStatus from "../mutations/analysis/updateLectureStatus.js";
import type * as mutations_index from "../mutations/index.js";
import type * as mutations_lectures_createLecture from "../mutations/lectures/createLecture.js";
import type * as mutations_lectures_deleteLecture from "../mutations/lectures/deleteLecture.js";
import type * as mutations_lectures_index from "../mutations/lectures/index.js";
import type * as mutations_lectures_submitResponse from "../mutations/lectures/submitResponse.js";
import type * as mutations_lectures_updateLecture from "../mutations/lectures/updateLecture.js";
import type * as mutations_users_index from "../mutations/users/index.js";
import type * as mutations_users_updateUserProfile from "../mutations/users/updateUserProfile.js";
import type * as mutations_users_updateUserRole from "../mutations/users/updateUserRole.js";
import type * as queries_analysis_getAllLecturesAverage from "../queries/analysis/getAllLecturesAverage.js";
import type * as queries_analysis_getAnalysisData from "../queries/analysis/getAnalysisData.js";
import type * as queries_analysis_getBasicStatistics from "../queries/analysis/getBasicStatistics.js";
import type * as queries_analysis_getClosableLectures from "../queries/analysis/getClosableLectures.js";
import type * as queries_analysis_getCrossAnalysisData from "../queries/analysis/getCrossAnalysisData.js";
import type * as queries_analysis_getLatestAnalysisResults from "../queries/analysis/getLatestAnalysisResults.js";
import type * as queries_analysis_index from "../queries/analysis/index.js";
import type * as queries_index from "../queries/index.js";
import type * as queries_lectures_getLecture from "../queries/lectures/getLecture.js";
import type * as queries_lectures_getLectures from "../queries/lectures/getLectures.js";
import type * as queries_lectures_index from "../queries/lectures/index.js";
import type * as queries_responses_checkSurveyAvailable from "../queries/responses/checkSurveyAvailable.js";
import type * as queries_responses_getResponseCount from "../queries/responses/getResponseCount.js";
import type * as queries_responses_index from "../queries/responses/index.js";
import type * as queries_users_getAdminUsers from "../queries/users/getAdminUsers.js";
import type * as queries_users_getCurrentUser from "../queries/users/getCurrentUser.js";
import type * as queries_users_getUser from "../queries/users/getUser.js";
import type * as queries_users_getUserProfile from "../queries/users/getUserProfile.js";
import type * as queries_users_getUsers from "../queries/users/getUsers.js";
import type * as queries_users_index from "../queries/users/index.js";
import type * as services_analysis_calculators_crossAnalysisCalculator from "../services/analysis/calculators/crossAnalysisCalculator.js";
import type * as services_analysis_calculators_distributionCalculator from "../services/analysis/calculators/distributionCalculator.js";
import type * as services_analysis_calculators_index from "../services/analysis/calculators/index.js";
import type * as services_analysis_calculators_summaryCalculator from "../services/analysis/calculators/summaryCalculator.js";
import type * as services_analysis_index from "../services/analysis/index.js";
import type * as services_analysis_transformers_index from "../services/analysis/transformers/index.js";
import type * as services_analysis_transformers_responseTransformer from "../services/analysis/transformers/responseTransformer.js";
import type * as services_analysis_validators_analysisValidator from "../services/analysis/validators/analysisValidator.js";
import type * as services_analysis_validators_index from "../services/analysis/validators/index.js";
import type * as services_common_index from "../services/common/index.js";
import type * as services_common_statistics from "../services/common/statistics.js";
import type * as services_common_utilities from "../services/common/utilities.js";
import type * as services_lectures_validators_lectureValidator from "../services/lectures/validators/lectureValidator.js";
import type * as services_questions_definitions from "../services/questions/definitions.js";
import type * as services_users_helpers_userHelpers from "../services/users/helpers/userHelpers.js";
import type * as services_users_validators_userValidator from "../services/users/validators/userValidator.js";
import type * as shared_helpers_authHelpers from "../shared/helpers/authHelpers.js";
import type * as shared_lib_constants from "../shared/lib/constants.js";
import type * as shared_lib_dateUtils from "../shared/lib/dateUtils.js";
import type * as shared_lib_idUtils from "../shared/lib/idUtils.js";
import type * as shared_lib_validation from "../shared/lib/validation.js";
import type * as shared_schemas_analysis from "../shared/schemas/analysis.js";
import type * as shared_schemas_lectures from "../shared/schemas/lectures.js";
import type * as shared_schemas_operationLogs from "../shared/schemas/operationLogs.js";
import type * as shared_schemas_questionSets from "../shared/schemas/questionSets.js";
import type * as shared_schemas_responses from "../shared/schemas/responses.js";
import type * as shared_schemas_users from "../shared/schemas/users.js";
import type * as shared_types_analysis from "../shared/types/analysis.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "actions/analysis/closeLectureOrchestrator": typeof actions_analysis_closeLectureOrchestrator;
  "actions/analysis/executeCompleteAnalysis": typeof actions_analysis_executeCompleteAnalysis;
  "actions/analysis/helpers": typeof actions_analysis_helpers;
  "actions/analysis/index": typeof actions_analysis_index;
  "api/admin": typeof api_admin;
  "api/analysisResults": typeof api_analysisResults;
  "api/lectures": typeof api_lectures;
  "api/responses": typeof api_responses;
  "api/users": typeof api_users;
  auth: typeof auth;
  crons: typeof crons;
  http: typeof http;
  "mutations/analysis/createResultSet": typeof mutations_analysis_createResultSet;
  "mutations/analysis/index": typeof mutations_analysis_index;
  "mutations/analysis/saveAnalysisResults": typeof mutations_analysis_saveAnalysisResults;
  "mutations/analysis/updateLectureStatus": typeof mutations_analysis_updateLectureStatus;
  "mutations/index": typeof mutations_index;
  "mutations/lectures/createLecture": typeof mutations_lectures_createLecture;
  "mutations/lectures/deleteLecture": typeof mutations_lectures_deleteLecture;
  "mutations/lectures/index": typeof mutations_lectures_index;
  "mutations/lectures/submitResponse": typeof mutations_lectures_submitResponse;
  "mutations/lectures/updateLecture": typeof mutations_lectures_updateLecture;
  "mutations/users/index": typeof mutations_users_index;
  "mutations/users/updateUserProfile": typeof mutations_users_updateUserProfile;
  "mutations/users/updateUserRole": typeof mutations_users_updateUserRole;
  "queries/analysis/getAllLecturesAverage": typeof queries_analysis_getAllLecturesAverage;
  "queries/analysis/getAnalysisData": typeof queries_analysis_getAnalysisData;
  "queries/analysis/getBasicStatistics": typeof queries_analysis_getBasicStatistics;
  "queries/analysis/getClosableLectures": typeof queries_analysis_getClosableLectures;
  "queries/analysis/getCrossAnalysisData": typeof queries_analysis_getCrossAnalysisData;
  "queries/analysis/getLatestAnalysisResults": typeof queries_analysis_getLatestAnalysisResults;
  "queries/analysis/index": typeof queries_analysis_index;
  "queries/index": typeof queries_index;
  "queries/lectures/getLecture": typeof queries_lectures_getLecture;
  "queries/lectures/getLectures": typeof queries_lectures_getLectures;
  "queries/lectures/index": typeof queries_lectures_index;
  "queries/responses/checkSurveyAvailable": typeof queries_responses_checkSurveyAvailable;
  "queries/responses/getResponseCount": typeof queries_responses_getResponseCount;
  "queries/responses/index": typeof queries_responses_index;
  "queries/users/getAdminUsers": typeof queries_users_getAdminUsers;
  "queries/users/getCurrentUser": typeof queries_users_getCurrentUser;
  "queries/users/getUser": typeof queries_users_getUser;
  "queries/users/getUserProfile": typeof queries_users_getUserProfile;
  "queries/users/getUsers": typeof queries_users_getUsers;
  "queries/users/index": typeof queries_users_index;
  "services/analysis/calculators/crossAnalysisCalculator": typeof services_analysis_calculators_crossAnalysisCalculator;
  "services/analysis/calculators/distributionCalculator": typeof services_analysis_calculators_distributionCalculator;
  "services/analysis/calculators/index": typeof services_analysis_calculators_index;
  "services/analysis/calculators/summaryCalculator": typeof services_analysis_calculators_summaryCalculator;
  "services/analysis/index": typeof services_analysis_index;
  "services/analysis/transformers/index": typeof services_analysis_transformers_index;
  "services/analysis/transformers/responseTransformer": typeof services_analysis_transformers_responseTransformer;
  "services/analysis/validators/analysisValidator": typeof services_analysis_validators_analysisValidator;
  "services/analysis/validators/index": typeof services_analysis_validators_index;
  "services/common/index": typeof services_common_index;
  "services/common/statistics": typeof services_common_statistics;
  "services/common/utilities": typeof services_common_utilities;
  "services/lectures/validators/lectureValidator": typeof services_lectures_validators_lectureValidator;
  "services/questions/definitions": typeof services_questions_definitions;
  "services/users/helpers/userHelpers": typeof services_users_helpers_userHelpers;
  "services/users/validators/userValidator": typeof services_users_validators_userValidator;
  "shared/helpers/authHelpers": typeof shared_helpers_authHelpers;
  "shared/lib/constants": typeof shared_lib_constants;
  "shared/lib/dateUtils": typeof shared_lib_dateUtils;
  "shared/lib/idUtils": typeof shared_lib_idUtils;
  "shared/lib/validation": typeof shared_lib_validation;
  "shared/schemas/analysis": typeof shared_schemas_analysis;
  "shared/schemas/lectures": typeof shared_schemas_lectures;
  "shared/schemas/operationLogs": typeof shared_schemas_operationLogs;
  "shared/schemas/questionSets": typeof shared_schemas_questionSets;
  "shared/schemas/responses": typeof shared_schemas_responses;
  "shared/schemas/users": typeof shared_schemas_users;
  "shared/types/analysis": typeof shared_types_analysis;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
