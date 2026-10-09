# Articles

Each `.md` file in this folder is one article on the site. The file name becomes the address,
so `mla-office-tips.md` is published at `/articles/mla-office-tips` (and `/hi/articles/mla-office-tips`).
Add a file, then rebuild (or reload, under `next dev`), and it shows on the Articles page, in the
sitemap and in "Related reading". Files starting with `_` are skipped, so `_draft.md` stays hidden.

## Front matter

```md
---
title: "MLA office tips"
description: "One or two sentences for the list and for search results."
topic: office
cover: officeTeam
minutes: 6
order: 9
---
```

- `title`: required (or start the text with a `# Title` line instead).
- `topic`: required, one of `office`, `constituency`, `party`, `appointments`, `governance`.
- `cover`: required, a picture key from `content/media.ts` (for example `officeTeam`, `eletter`, `pnr`).
- `description`: optional; defaults to the first paragraph.
- `minutes`: optional; worked out from the length if left out.
- `order`: optional; lower comes first and the first article is featured. Articles without one follow, by title.

Put values with a colon in double quotes. The build stops with the file name if a key is wrong.

## Text

```md
## Section heading (listed in "On this page")
### Smaller heading

A paragraph. Lines next to each other join into one paragraph; a blank line starts the next.

> A quote.

- A bullet
- Another bullet

1. A numbered step
2. The next step

| Column | Column |
| --- | --- |
| Cell | Cell |

![Describe the picture for screen readers](eletter)
```

Text is plain: `**bold**`, `_italics_` and `[links](...)` show as typed. Pictures use keys from
`content/media.ts`; to add a new one, put the `.webp` in `assets/media/` and add it there.
Articles are English only.
