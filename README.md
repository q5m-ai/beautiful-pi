# Beautiful Pi

A compact, polished timeline renderer for Pi agents in Paseo.

The first MVP replaces Paseo reasoning rows with a cross-platform Markdown renderer while preserving paced streaming. It supports:

- headings, paragraphs, and thematic breaks
- ordered and unordered lists
- blockquotes
- fenced code blocks with optional language labels
- bold, italic, strikethrough, inline code, and safe HTTP(S)/email links
- light, dark, desktop, and compact layouts through Paseo theme tokens

## Development

```sh
npm install
npm run typecheck
```

## Try it locally

Plugins are trusted, unsandboxed code. After inspecting the source and enabling plugins in Paseo, install the checkout on the daemon host:

```sh
paseo plugin install /absolute/path/to/beautiful-pi
```

Then run a Pi agent turn that produces formatted reasoning. Beautiful Pi transforms reasoning from the first streaming delta and renders the completed history with the same component.

## Compatibility

- Paseo `>=0.8.0 <1.0.0`
