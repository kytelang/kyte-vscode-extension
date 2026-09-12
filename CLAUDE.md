# CLAUDE.md - kyte-vscode-extension

## What this is

The VS Code extension for Kyte: syntax highlighting, language configuration, snippets, file icons, a
"run current file" command, and a language-server client that launches the `kynalyzer` LSP. This is
Node/TypeScript, not Zig. It is version 1.0.0 and pairs with the matching `kynalyzer` server. See
[README.md](README.md) for the feature list and editor setup.

This repo is the editor client only. The language server it drives lives in the sibling **kynalyzer** repo,
and the language itself in **kyte**; both are separate repos.

## Build, test and package

Prerequisites: Node.js and npm. Install once with `npm install`, then:

```bash
npm run compile       # tsc -p ./  -> compiles src/ TypeScript into out/
npm run watch         # tsc -watch -p ./  -> recompile on change
npm run lint          # eslint over src/
npm run test:grammar  # vscode-tmgrammar-test against the TextMate grammar using tests/grammar/*.ky and *.kyx
npm run package       # vsce package --no-dependencies  -> produces the .vsix (e.g. kyte-vscode-1.0.0.vsix)
```

`vscode:prepublish` runs `npm run compile`, so packaging always ships freshly built `out/`. The extension
targets VS Code `^1.80.0` (see `engines` in [package.json](package.json)). `vsce` comes from
`@vscode/vsce`; run it via `npx vsce` if it is not on `PATH`.

## How it finds the server

The extension is a thin client: it does not contain the analyser. At runtime it discovers the `kynalyzer`
binary in this order: the `kyte.server.path` setting (a leading `~` is expanded), then `kynalyzer` on
`PATH`, then `~/.kyte/bin/kynalyzer` (where kynalyzer's own `zig build` installs it). If none is found,
highlighting, icons and the run command still work and a one-time message explains how to enable the rest.

## Version sync (do not let it drift)

The `version` in `package.json` must stay aligned with the `kynalyzer` server version (build.zig.zon and the
server's reported `serverInfo`) and with `kyte` at a release: the extension and the server move together. Bump
all three in the same breath; kynalyzer's `zig build test` asserts the server side of this, so update here to
match whenever you bump there. Keep `CHANGELOG.md` in step with the version.

## Working in this repo (how to make a change)

1. **Understand, then plan.** Read `src/extension.ts` (activation, server discovery and launch, the
   commands) and the relevant contributed asset (grammar, snippets, icons) in `package.json` before editing.
   Keep the change minimal and match the surrounding TypeScript and JSON style; do not reformat unrelated
   files.
2. **Verify real behaviour, not just compilation.** `npm run compile` passing is not done: package the
   `.vsix`, install it into VS Code (or run the Extension Development Host), open a `.ky`/`.kyx` file, and
   confirm highlighting, the server features, and the run command actually work. For grammar edits,
   `npm run test:grammar` is the behavioural check.
3. **Run the build and tests before and after.** At minimum `npm run compile` and `npm run lint`, plus
   `npm run test:grammar` for any grammar change.
4. **Keep versions aligned.** If you touch the version, update `kynalyzer` and `kyte` to match and note it in
   `CHANGELOG.md`.
5. **Commit only when asked**; if you are on `main`, branch first. Do not commit build output (`out/`) or the
   generated `.vsix` unless the release process calls for it.
6. **Respect the repo boundary.** Analysis behaviour belongs in the sibling **kynalyzer** repo, not here; this
   repo only launches the server and contributes editor assets.

## Layout map

- `src/extension.ts` - the extension entry point (TypeScript): activation, `kynalyzer` discovery and launch
  via `vscode-languageclient`, and the `kyte.runFile` / `kyte.restartServer` commands.
- `out/` - compiled JavaScript output of `src/` (build artefact; `main` is `./out/extension.js`).
- `syntaxes/` - the `kyte.tmLanguage.json` TextMate grammar (scope `source.ky`).
- `snippets/` - `kyte.json` code snippets.
- `fileicons/` + `icons/` - the Kyte icon theme and language/extension icons.
- `tests/grammar/` - grammar fixtures (`keywords.ky`, `nsx.kyx`) for `vscode-tmgrammar-test`.
- `linguist-submission/` - material for the GitHub Linguist language submission.
- `language-configuration.json` - bracket matching, auto-closing pairs, comment toggling.
- `package.json` - manifest: contributed languages, grammars, snippets, icon theme, commands, keybindings,
  settings, and the npm scripts above.

## Conventions and gotchas

- This is the only Kyte repo that is Node/TypeScript; the rest of the ecosystem is Zig (kyte, kynalyzer) or
  Kyte itself. Do not assume Zig tooling here.
- The extension must degrade gracefully when no server is present: never make highlighting, icons or the run
  command depend on `kynalyzer` being installed.
- Prose follows Indian English with British spellings (behaviour, colour, initialise) and no em dashes;
  never change code identifiers, settings keys (`kyte.server.path`) or command ids to match.
