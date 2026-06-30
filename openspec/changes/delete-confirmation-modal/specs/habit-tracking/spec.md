## MODIFIED Requirements

### Requirement: Delete habit
Users SHALL be able to permanently delete a habit. Deletion SHALL remove the habit and its check-in history via `DELETE /habits/:id`. Before deletion is executed, the habit form modal SHALL display an inline confirmation panel in place of the form content, requiring the user to confirm or cancel. The native browser `confirm()` dialog SHALL NOT be used.

#### Scenario: Deleting a habit shows an inline confirmation
- **WHEN** the user clicks the Delete button on an existing habit's edit modal
- **THEN** the modal replaces the form content with a confirmation panel asking the user to confirm the deletion

#### Scenario: Confirming deletion removes the habit
- **WHEN** the user confirms deletion in the inline confirmation panel
- **THEN** the habit is removed via `DELETE /habits/:id` and no longer appears in the habit list

#### Scenario: Cancelling deletion returns to the form
- **WHEN** the user cancels in the inline confirmation panel
- **THEN** the modal returns to showing the habit form with no change made to the habit
