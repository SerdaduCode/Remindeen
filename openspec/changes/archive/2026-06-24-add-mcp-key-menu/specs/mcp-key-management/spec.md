## ADDED Requirements

### Requirement: Generate an MCP key from the extension
A signed-in user SHALL be able to generate a new MCP API key from the Productivity page, optionally labeling it, and SHALL see the plaintext key exactly once.

#### Scenario: Successful generation
- **WHEN** a signed-in user opens the MCP Keys menu and chooses "Generate New Key" with an optional label
- **THEN** the extension calls `POST /auth/api-keys` and displays the returned plaintext key in a reveal view with a copy-to-clipboard control

#### Scenario: Plaintext key is not retrievable again
- **WHEN** the user closes the reveal view after generating a key
- **THEN** the plaintext key is discarded from extension state and is not shown again by any subsequent view of the keys list

### Requirement: List existing MCP keys
A signed-in user SHALL be able to view their own MCP keys, including label, creation time, last-used time, and expiry, without the plaintext key or its hash ever being displayed.

#### Scenario: Viewing the keys list
- **WHEN** a signed-in user opens the MCP Keys menu
- **THEN** the extension calls `GET /auth/api-keys` and renders each key's label, createdAt, lastUsedAt, and expiresAt

### Requirement: Revoke an MCP key with confirmation
A signed-in user SHALL be able to revoke one of their own MCP keys, and SHALL be asked to confirm the action before it takes effect.

#### Scenario: Revoking with confirmation
- **WHEN** a signed-in user chooses to revoke a key
- **THEN** the extension shows a confirmation step naming that key's label before calling `DELETE /auth/api-keys/:id`

#### Scenario: List updates after revocation
- **WHEN** a key revocation succeeds
- **THEN** the keys list no longer shows that key

### Requirement: MCP key management is gated behind sign-in
The MCP Keys menu entry and its modal SHALL only be reachable from the signed-in state of the Productivity page.

#### Scenario: Signed-out user cannot reach key management
- **WHEN** a user is not signed in and views the Productivity page
- **THEN** the sign-in prompt is shown instead of the page content, and the MCP Keys menu is not present
