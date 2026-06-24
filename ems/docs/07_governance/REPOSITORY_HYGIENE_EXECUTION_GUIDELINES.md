Status: Active
Authority Level: High
Last Reviewed: 2026-06-17
Owner: AI

# Repository Hygiene Execution Guidelines

> Practical step-by-step process for executing SAFE_REPOSITORY_HYGIENE
> actions in this repository. Complements `SAFE_REPOSITORY_HYGIENE_POLICY.md`
> (what is allowed) with how to actually do it correctly.

---

## Before You Start

1. **Confirm the action is SAFE_REPOSITORY_HYGIENE** — check against
   `SAFE_REPOSITORY_HYGIENE_POLICY.md`. If ambiguous, default to
   REQUIRES_APPROVAL and ask the user.

2. **Read all files before editing** — the Edit tool requires a file to be
   read before modification. Read every file you intend to touch.

3. **Plan cross-link updates before executing moves** — before renaming a
   folder or moving a file, identify all documents that reference the old
   path. Execute the move and all cross-link updates in the same session
   so no cross-references are left broken between sessions.

4. **Verify you are not touching source code** — if in doubt, check the
   file extension. `.md` files are documentation. `.ts`, `.js`, `.json`
   files (except `README.md`, `*.md`) are code/config; apply the
   REQUIRES_APPROVAL classification.

---

## Executing Documentation File Moves

### Step 1: Identify the file and its destination

Confirm:
- Source path (e.g., `docs/canon/domain-model.md`)
- Destination path (e.g., `docs/legacy/domain-model.md`)
- Destination folder exists or must be created first

### Step 2: Find all cross-references

Search for the old path in all `.md` files:
```
Grep for: "canon/domain-model" (or the relevant path fragment)
Scope: docs/**/*.md
```

Record every file that contains a reference to the old path.

### Step 3: Create the destination folder if needed

If `docs/legacy/` does not yet exist, it is created implicitly when the
first file is written there. There is no need to pre-create it separately.

### Step 4: Write the file at its new location

Use the Write tool to create the file at the destination path with identical
content. This is a copy step — the original still exists.

### Step 5: Add a forwarding note to the original (optional, for high-traffic files)

For frequently-referenced files, add a one-line forwarding note to the
original before removing it:
```
> **Moved.** This file has been relocated to `docs/legacy/domain-model.md`.
```

### Step 6: Remove the original

After confirming the copy at the destination is correct, the original can
be removed. However, in this repository, prefer adding a forwarding note
and leaving the original in place rather than deleting, to avoid broken
links for readers with bookmarked paths. Confirm with the user if unsure.

### Step 7: Update all cross-references

For each file identified in Step 2, update the path from the old location
to the new location using the Edit tool.

### Step 8: Log the action

Add an entry to the session report:
```
| MOVE | docs/canon/domain-model.md → docs/legacy/domain-model.md | Cross-refs updated in: [list files] |
```

---

## Executing Folder Renames

A folder cannot be renamed in place using file tools — it must be done by
moving all files and updating all references.

### Process for `docs/canon/` → `docs/legacy/`

1. Read all 10 files in `docs/canon/` to confirm their content.
2. Write each file to `docs/legacy/<filename>.md` with identical content.
3. Add a forwarding note to each original in `docs/canon/` (so the old
   path still works for any reader who navigated there directly).
4. Grep for `docs/canon/` across all `.md` files in `docs/`.
5. Update every cross-reference from `docs/canon/` to `docs/legacy/`.
6. Log all 10 moves and all cross-reference updates in the session report.

---

## Applying Retirement Header Notes

When applying a retirement/status blockquote to a legacy document:

1. Read the file first.
2. Prepend the blockquote before the first `#` heading (after any frontmatter).
3. Use the standard format:
   ```
   > **Status: [Retired / Retired (Partial) / Obsolete / Historical].**
   > [One or two sentences explaining why and where the authoritative
   > replacement lives.]
   ```
4. Do not modify any content below the blockquote.
5. Log the addition in the session report.

---

## Updating Governance Metadata

When updating `Status:`, `Last Reviewed:`, `Owner:`, or `Authority Level:`
header fields:

1. Read the file.
2. Edit only the header field(s) that need updating.
3. Do not change the document body.
4. Log the update in the session report.

---

## Updating Cross-Reference Links

When fixing a stale cross-reference in a documentation file:

1. Grep for the old path pattern to find all occurrences.
2. For each file, read the file and confirm the reference exists.
3. Use Edit to replace the old path with the new path.
4. Verify the replacement is correct (no extra context changed).
5. Log each file updated in the session report.

---

## Adding Rows to Registers and Matrices

When adding a new entry to a gap register, delta log, risk register, or
classification matrix:

1. Read the file to confirm the current last entry number.
2. Follow the existing row format exactly (column alignment, numbering, etc.).
3. Append the new row at the end of the relevant table.
4. Do not renumber or reformat existing rows.
5. Log the addition in the session report.

---

## Creating New README Files

When creating a README for a previously-undocumented folder:

1. Check whether a README already exists in that folder.
2. Identify all files in the folder using Glob.
3. Read the most important files (or all, if few) to understand their purpose.
4. Write a README that covers: what the folder contains, each file's purpose,
   and relevant authority document references.
5. Follow the standard doc header format:
   ```
   Status: Active
   Authority Level: Supporting
   Last Reviewed: [date]
   Owner: AI
   ```
6. Log the creation in the session report.

---

## Session Report Requirements

Every session that executes SAFE_REPOSITORY_HYGIENE actions must produce or
update a report in `docs/08_reports/` containing:

```markdown
## SAFE_REPOSITORY_HYGIENE ACTIONS EXECUTED

| # | Action Type | Files Affected | Notes |
|---|---|---|---|
| 1 | [type] | [file or folder path] | [any relevant notes] |
| 2 | ... | ... | ... |
```

If the session also produced primary output documents (e.g., a normalization
report or restructuring plan), the hygiene actions table may be included as
a section within that report rather than as a separate file.

---

## Things to Never Do Under SAFE_REPOSITORY_HYGIENE

- **Never delete content** — if content is being retired, add a header note
  and move to archive; do not delete the file.
- **Never edit source code** — `.ts`, `.js`, `package.json` dependencies,
  build config, and infrastructure config are out of scope.
- **Never modify the content of an authority document** beyond `Status:`/
  `Last Reviewed:` metadata — content edits to `docs/00_authority/*`,
  `docs/01_backend/*`, `docs/03_fullstack_contracts/*`, and
  `docs/07_governance/*` follow the Documentation Freshness Policy, not
  hygiene rules.
- **Never batch hygiene with feature work** — if a session includes both
  hygiene actions and feature/code work, the code changes follow their
  own AUTONOMOUS / REQUIRES_APPROVAL classification independently.
- **Never leave cross-references broken** — if you rename a folder or move
  a file, update all cross-references in the same session.
