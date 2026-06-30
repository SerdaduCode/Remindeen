## MODIFIED Requirements

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
