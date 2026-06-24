## Why

The al-quotes backend (`add-mcp-server`) adds an MCP server that AI clients (Hermes Agent, Claude Desktop, etc.) can connect to using a per-user API key. Users need a way to generate, view, and revoke that key themselves, gated behind the Google sign-in they already have in the extension — no separate web page, no manual database access.

## What Changes

- Replace the standalone floating "Sign out" button on the Productivity page (`ProductivityPage.tsx`, Page 2 of the newtab) with a single floating menu button that expands into two actions: **Sign out** and **MCP Keys**.
- "MCP Keys" opens a glass modal (visually consistent with the existing `HabitFormModal`) that:
  - Lists the signed-in user's keys: `label`, `createdAt`, `lastUsedAt`, `expiresAt`, with a revoke action per row (revoke requires a confirmation step naming the key's label).
  - Offers a "Generate New Key" action that prompts for an optional `label` (e.g. "Hermes Agent"), then displays the new plaintext key exactly once with a copy-to-clipboard control and an explicit "you won't be able to see this again" warning.
- The modal talks directly to al-quotes' existing `/auth/api-keys` endpoints (`POST`, `GET`, `DELETE`) using the user's current JWT — those endpoints are unchanged by this proposal.
- Plaintext key values are never written to any persisted store (no zustand-persisted state, no `chrome.storage`); they exist only in the modal's local component state for the duration of the reveal, and are discarded when the modal closes.

## Capabilities

### New Capabilities
- `mcp-key-management`: generating, listing, and revoking MCP API keys from the extension UI.

## Impact

- `components/remindeen/productivity/ProductivityPage.tsx`: the sign-out-only floating button becomes a menu trigger offering Sign out / MCP Keys.
- New component(s): a keys modal (list + generate + revoke) and a key-reveal view within it.
- No changes to al-quotes; this proposal only consumes the already-existing `/auth/api-keys` endpoints.
- **Sequencing**: `ProductivityPage.tsx` is also being actively built out by `redesign-productivity-glass-ui` (in-progress, not yet archived). This change should land after that one archives, to avoid editing the same file mid-flight.
