import { AccessTokenResponse } from "./AccessTokenResponse";
/**
 * The value of the manage field is an object with the following properties:
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-3.2.1-3
 */
export type Manage = {
  uri: string;
  access_token: AccessTokenResponse;
};
