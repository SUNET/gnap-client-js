/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_assertion_consumer_service_saml2_sp_saml2_acs_post } from "../models/Body_assertion_consumer_service_saml2_sp_saml2_acs_post";
import type { Body_user_code_finish_interaction_code_post } from "../models/Body_user_code_finish_interaction_code_post";
import type { ContinueRequest } from "../models/ContinueRequest";
import type { GrantRequest } from "../models/GrantRequest";
import type { GrantResponse } from "../models/GrantResponse";
import type { JWKS } from "../models/JWKS";
import type { JWKTypes } from "../models/JWKTypes";
import type { StatusResponse } from "../models/StatusResponse";

import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export class DefaultService {
  /**
   * Get Jwks
   * @returns JWKS Successful Response
   * @throws ApiError
   */
  public static getJwksWellKnownJwksJsonGet(): CancelablePromise<JWKS> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/.well-known/jwks.json",
    });
  }

  /**
   * Get Jwk
   * @returns JWKTypes Successful Response
   * @throws ApiError
   */
  public static getJwkWellKnownJwkJsonGet(): CancelablePromise<JWKTypes> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/.well-known/jwk.json",
    });
  }

  /**
   * Get Public Pem
   * @returns any Successful Response
   * @throws ApiError
   */
  public static getPublicPemWellKnownPublicPemGet(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/.well-known/public.pem",
    });
  }

  /**
   * Transaction
   * @param requestBody
   * @param clientCert
   * @param detachedJws
   * @returns GrantResponse Successful Response
   * @throws ApiError
   */
  public static transactionTransactionPost(
    requestBody: GrantRequest,
    clientCert?: string,
    detachedJws?: string,
  ): CancelablePromise<GrantResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "https://auth-test.sunet.se/transaction",
      headers: {
        "client-cert": clientCert,
        "detached-jws": detachedJws,
        cors: "no-cors",
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Continue Transaction
   * @param requestBody
   * @param continueReference
   * @param clientCert
   * @param detachedJws
   * @param authorization
   * @returns GrantResponse Successful Response
   * @throws ApiError
   */
  public static continueTransactionContinuePost(
    requestBody: ContinueRequest,
    continueReference?: string,
    clientCert?: string,
    detachedJws?: string,
    authorization?: string,
  ): CancelablePromise<GrantResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/continue",
      headers: {
        "client-cert": clientCert,
        "detached-jws": detachedJws,
        authorization: authorization,
      },
      query: {
        continue_reference: continueReference,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Continue Transaction
   * @param continueReference
   * @param requestBody
   * @param clientCert
   * @param detachedJws
   * @param authorization
   * @returns GrantResponse Successful Response
   * @throws ApiError
   */
  public static continueTransactionContinueContinueReferencePost(
    continueReference: string,
    requestBody: ContinueRequest,
    clientCert?: string,
    detachedJws?: string,
    authorization?: string,
  ): CancelablePromise<GrantResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/continue/{continue_reference}",
      path: {
        continue_reference: continueReference,
      },
      headers: {
        "client-cert": clientCert,
        "detached-jws": detachedJws,
        authorization: authorization,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Redirect
   * @param transactionId
   * @returns string Successful Response
   * @throws ApiError
   */
  public static redirectInteractionRedirectTransactionIdGet(
    transactionId: string,
  ): CancelablePromise<string> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/interaction/redirect/{transaction_id}",
      path: {
        transaction_id: transactionId,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * User Code Input
   * @returns string Successful Response
   * @throws ApiError
   */
  public static userCodeInputInteractionCodeGet(): CancelablePromise<string> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/interaction/code",
    });
  }

  /**
   * User Code Finish
   * @param formData
   * @returns string Successful Response
   * @throws ApiError
   */
  public static userCodeFinishInteractionCodePost(
    formData: Body_user_code_finish_interaction_code_post,
  ): CancelablePromise<string> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/interaction/code",
      formData: formData,
      mediaType: "application/x-www-form-urlencoded",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Authenticate
   * @param transactionId
   * @param idp
   * @returns string Successful Response
   * @throws ApiError
   */
  public static authenticateSaml2SpAuthnTransactionIdGet(
    transactionId: string,
    idp?: string,
  ): CancelablePromise<string> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/saml2/sp/authn/{transaction_id}",
      path: {
        transaction_id: transactionId,
      },
      query: {
        idp: idp,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Discovery Service Response
   * @param target
   * @param entityId
   * @returns string Successful Response
   * @throws ApiError
   */
  public static discoveryServiceResponseSaml2SpDiscoveryResponseGet(
    target?: string,
    entityId?: string,
  ): CancelablePromise<string> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/saml2/sp/discovery-response",
      query: {
        target: target,
        entityID: entityId,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Assertion Consumer Service
   * Assertion consumer service, receives POSTs from SAML2 IdP's
   * @param formData
   * @returns string Successful Response
   * @throws ApiError
   */
  public static assertionConsumerServiceSaml2SpSaml2AcsPost(
    formData: Body_assertion_consumer_service_saml2_sp_saml2_acs_post,
  ): CancelablePromise<string> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/saml2/sp/saml2-acs",
      formData: formData,
      mediaType: "application/x-www-form-urlencoded",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Metadata
   * @returns any Successful Response
   * @throws ApiError
   */
  public static metadataSaml2SpMetadataGet(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/saml2/sp/metadata",
    });
  }

  /**
   * Healthy
   * @returns StatusResponse Successful Response
   * @throws ApiError
   */
  public static healthyStatusHealthyGet(): CancelablePromise<StatusResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/status/healthy",
    });
  }
}
