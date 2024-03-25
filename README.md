# gnap-client-js

Implemented using as a reference the draft #19 of the GNAP protocol.

Compared to the last version 19 https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-19:

- JOSE types to no longer use subtypes. For example: "gnap-binding+jws" is now "gnap-binding-jws". Changed in version 19: https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-19/#appendix-A-2.1.2.2.1
- Removed "dpop" and "oauthpop" from the list of ProofMethod. See: https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-19/#appendix-A-2.14.1
- Types name use "InteractionStartMode" instead of "StartInteractionMethod". See: https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-19#appendix-A-2.14.2.3.1 and https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-19#appendix-A-2.16.2.3.1

Moreover:

- Added reference to the draft in the types definitions comments
- Fix which types are mandatory or not.

Compared to inital implemented version 10:

- Make default hash algorithm SHA256 instead of SHA3-512. https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-19/#appendix-A-2.8.2.1.1
