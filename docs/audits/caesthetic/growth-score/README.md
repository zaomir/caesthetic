# Growth Score audit storage

This directory is the single navigation layer for every CAESTHETIC Growth
Score audit in both `zaomir/grainee-v2` and `zaomir/caesthetic`.

## Layout

```text
docs/audits/caesthetic/growth-score/
├── README.md
├── audit-case.schema.json
├── index.generated.json
└── cases/
    └── <audit-id>/
        ├── case.json
        ├── research/        # optional, public sources only
        ├── evidence/        # optional, repo-safe captures/notes
        ├── drafts/          # optional working drafts
        └── reviews/         # optional decision history without credentials
```

`case.json` is mandatory and is the stable entry point. Repo-safe report records
live under `cases/<audit-id>/reports/` and are mirrored to both repositories.
The case card separately records matching production outputs under
`site-caesthetic/score/**`; those outputs, named-client HTML and runtime access
material are not satellite authoring paths.

## Rules

- Use the same lowercase `audit_id` for the folder and `case.json`.
- Keep only public/open-source evidence in this shared tree.
- Never store passwords, hashes, tokens, private contacts, CRM exports,
  appointment data or private attachments here.
- Put every working file under its case folder; do not create a new
  `docs/projects/caesthetic/clients/<name>` folder.
- A Multi-Location case lists the parent and focus-location `report.json`
  records in one card.
- Run `node scripts/caesthetic/audit-storage.mjs --check` before commit.
- Regenerate the navigation index with
  `node scripts/caesthetic/audit-storage.mjs --write`.

`catalog_visibility=private` means “not listed on the public CAESTHETIC site.”
It does not make a file secret inside the public `zaomir/caesthetic` repository.
