// Error management / definitions
// Back-end seems to answer with http 400 and "details" in the body when there is an error

// In the GNAP:
/**
 * error (object):
 * An error code indicating that something has gone wrong. REQUIRED for an error condition.
 * If included, other fields MUST NOT be included. See Section 3.6.
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-10#name-grant-response
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#name-grant-response
 */

/**
 *  3.6. Error Response
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-10#response-error
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#name-error-response
 */
