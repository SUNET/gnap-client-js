# gnap-client-js

In sync with the backend implementation https://github.com/SUNET/sunet-auth-server, gnap-client-js is implemented using as a reference the draft #10 of the GNAP protocol https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-10

However some updates have been applied compared to the implemented version 10:

- Make default hash algorithm SHA256 instead of SHA3-512. https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-19/#appendix-A-2.8.2.1.1

Some fixes have been applied to the typescript-client types extracted from the local server https://api.eduid.docker/auth/openapi.json:

- AccessTokenRequest.access = null fixed to Array<string | Access>
- commented out export OpenAPI and OpenAPIConfig in typescript-client
