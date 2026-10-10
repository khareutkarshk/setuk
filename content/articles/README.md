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
Inside text: **bold**, [a page on the site](/how-we-work), [another article](/articles/file-name),
[an outside page](https://example.gov.in) and a citation marker.[^source]

> A quote.
> — Who said it (optional last line, starting with — or --)

> [!NOTE]
> A callout. Use NOTE, TIP or WARNING; a title can follow on the first line: > [!TIP] Short title

- A bullet
- Another bullet

1. A numbered item
2. The next item

::: steps
1. **First step** What to do. Each step needs a bold title.
2. **Second step** And so on.
:::

| Column | Column |
| --- | --- |
| Cell | Cell |

![Describe the picture for screen readers](eletter)

@[Caption for the video](https://www.youtube.com/watch?v=VIDEO_ID)

## Sources

[^source]: Publisher. [Title of the source](https://example.gov.in/page).
```

Site links start with `/` and are written without `/hi`; they keep Hindi readers on `/hi`. The
build stops if one points at a page that doesn't exist. Outside links open in a new tab. Citations
are numbered in the order their `[^id]:` lines are listed, so put those together at the end; every
`[^id]` in the text needs one. Videos are YouTube only and load from youtube-nocookie.com.

Pictures use keys from `content/media.ts`; to add a new one, put the `.webp` in `assets/media/`
and add it there. `_italics_` shows as typed. Articles are English only.
