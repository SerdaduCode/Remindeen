## Requirements

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
A signed-in user SHALL be able to revoke one of their own MCP keys. Before revocation is executed, the modal SHALL display an inline confirmation panel naming the key's label, requiring the user to confirm or cancel. The native browser `confirm()` dialog SHALL NOT be used.

#### Scenario: Revoking a key shows an inline confirmation
- **WHEN** a signed-in user clicks the revoke action on a key
- **THEN** the modal shows an inline confirmation panel naming that key's label, before any API call is made

#### Scenario: Confirming revocation removes the key
- **WHEN** the user confirms revocation in the inline confirmation panel
- **THEN** `DELETE /auth/api-keys/:id` is called and the key no longer appears in the keys list

#### Scenario: Cancelling revocation returns to the keys list
- **WHEN** the user cancels in the inline confirmation panel
- **THEN** no API call is made and the keys list is shown unchanged

### Requirement: MCP key management is gated behind sign-in
The MCP Keys menu entry and its modal SHALL only be reachable from the signed-in state of the Productivity page.

#### Scenario: Signed-out user cannot reach key management
- **WHEN** a user is not signed in and views the Productivity page
- **THEN** the sign-in prompt is shown instead of the page content, and the MCP Keys menu is not present
