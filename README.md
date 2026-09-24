# Beautiful Pi

A compact, polished timeline renderer for Pi agents in Paseo.

The first MVP replaces Paseo reasoning rows with a compact, recognizable thinking card while preserving paced streaming. It includes:

- a Brain icon and clear Reasoning label
- clean plain text with Pi's `**` markers removed
- restrained accent, surface, and typography treatment
- Pi-style shell previews with wrapped commands and output, the latest five lines, and tap-to-expand history
- consistent Running/Done states and collapsible completed sections
- a neutral reasoning rail and theme-accented shell activity
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

Then run a Pi agent turn that produces reasoning. Beautiful Pi transforms it from the first streaming delta and renders the completed history with the same component.

## Compatibility

- Paseo `>=0.8.0 <1.0.0`
