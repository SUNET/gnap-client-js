# gnap-client-js

Written in Javascript and Typescript. Types are exported and available to be used.

In sync with the backend implementation https://github.com/SUNET/sunet-auth-server, gnap-client-js is implemented using as a reference the draft #10 of the GNAP protocol https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-10

Key rotation was still missing in version 10. It will be defined in version 11 https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#appendix-A-2.10.2.2.1

However some updates have been back-ported:

- Make default hash algorithm SHA256 instead of SHA3-512. https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#appendix-A-2.9.2.1.1

Some fixes have been applied to the typescript-client types extracted from the local server https://api.eduid.docker/auth/openapi.json:

- AccessTokenRequest.access = null fixed to Array<string | Access>
- commented out export OpenAPI and OpenAPIConfig in typescript-client

The differences between version 10 and current last available version (v. 20) can be found in this diff: https://author-tools.ietf.org/iddiff?url1=draft-ietf-gnap-core-protocol-10&url2=draft-ietf-gnap-core-protocol-20&difftype=--html

# Status of the GNAP protocol

Last updated on the status of the draft-ietf-gnap-core-protocol version 20 is "Waiting on RFC-Editor" on 23 Mar 2024 https://www.iana.org/performance/ietf-draft-status

- draft-ietf-gnap-core-protocol 20 17 Mar 2024 Waiting on RFC-Editor 23 Mar 2024

Publication Queue
https://www.rfc-editor.org/current_queue.php
https://www.rfc-editor.org/about/queue/
https://www.iana.org/performance/ietf-draft-status/2024

Flowchart of RFC Editor Process: https://www.rfc-editor.org/about/queue/flowchart/

# Other implementations

https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-implementation-status
