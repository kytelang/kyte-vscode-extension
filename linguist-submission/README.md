# Linguist submission package for Kyte

This folder holds everything needed to add Kyte to
[github-linguist/linguist](https://github.com/github-linguist/linguist) so that
`.ky` and `.kyx` files get native syntax highlighting on github.com and count as
Kyte in the repository language bar.

It is prepared in advance. Do not open the PR until the adoption gate below is
met, otherwise it will be closed on sight.

## The one real blocker: adoption

Linguist's current rule (from their CONTRIBUTING.md):

> at least 2000 files per extension indexed in the last year, excluding forks,
> with reasonable distribution across diverse repositories.

Kyte does not meet this yet: almost every `.ky` file today lives inside the
`kytelang` org. Until public `.ky` usage crosses roughly 2000 files across many
independent, non-fork repositories, hold this PR. Until then `.ky`/`.kyx` render
plain (no colour) on github.com. That is the accepted trade: we deliberately do
NOT use a `linguist-language=TypeScript` override in `.gitattributes`, because
while it would add colour it also mislabels the files as TypeScript in the
repository language bar. An accurate language bar is worth more than interim
colour.

How to check where we stand (run occasionally):

- GitHub code search UI: search `extension:ky` and `extension:kyx`, then look at
  the "Repositories" facet for breadth (not just file count).
- The number must reflect diverse owners, not many files in one org.

There is deliberately no interim colour: `.ky`/`.kyx` stay plain on github.com
until Linguist lands. The `linguist-language=TypeScript` override was considered
and rejected, because it mislabels the files as TypeScript in the language bar.

## Name and extension: clear

As of this writing, `languages.yml` has no language named "Kyte" and does not
claim `.ky` or `.kyx`. The old `MissingBitStudios/kyte` (shader language, `.ky`)
and `kite-lang/kite` are both abandoned (no commits in 6+ and 12+ years) and were
never submitted to Linguist, so they do not compete for the extension. Re-verify
this at submission time, since another project could register in the interim.

## What goes in the PR

1. **languages.yml entry.** Paste `languages.yml.snippet` into
   `lib/linguist/languages.yml` in alphabetical position. Leave `language_id` out.

2. **Grammar.** Kyte's TextMate grammar lives in this very repository
   (`kyte-vscode-extension`): `syntaxes/kyte.tmLanguage.json`, scope
   `source.ky`, licensed Apache-2.0 (an allowed licence). Add it as a vendored
   grammar submodule with Linguist's helper:

   ```
   # from inside the linguist fork
   script/add-grammar https://github.com/kytelang/kyte-vscode-extension
   ```

   This wires `vendor/grammars/...` and `grammars.yml`. Commit the submodule
   change it produces. The grammar must pass Linguist's grammar analysis; if it
   flags anything, fix it in this repo first and re-run.

3. **Samples.** Copy every file from `samples/` here into `samples/Kyte/` in the
   linguist fork:

   | file        | why it is representative                                   |
   |-------------|------------------------------------------------------------|
   | `list.ky`   | generics, a core container type, methods, iteration        |
   | `string.ky` | the string library: many top-level and instance functions  |
   | `db.ky`     | traits/interfaces, a database abstraction seam             |
   | `app.ky`    | async and the web framework surface                        |
   | `form.kyx`  | NSX (`.kyx`): hypermedia templates as first-class strings  |

   These are real, in-use modules from `kytelang/kyte` and `kytelang/kynator`,
   not hello-world or tutorial files (which Linguist rejects). All are licensed
   Apache-2.0; state that in the PR description (see the template below).

4. **language_id.** From inside the linguist fork:

   ```
   bundle install
   script/update-ids
   ```

   Commit the generated id it writes back into `languages.yml`.

5. **Tests.**

   ```
   bundle exec rake test
   ```

   Must be green. (CI also runs this on the PR, so local run is optional but
   faster to iterate.)

## Field choices, and why

- `type: programming` - Kyte is a general-purpose language.
- `extensions: .ky, .kyx` - `.kyx` is the NSX (hypermedia) dialect; same grammar.
- `tm_scope: source.ky` - matches `scopeName` in the grammar.
- `ace_mode: text` - Kyte has no Ace mode; `text` is the accepted fallback.
- `color: "#6E56CF"` - the Kyte indigo, matching the extension's icon. Change if
  it clashes with a near-neighbour in the language bar.

## PR description template

> ## Adding the Kyte language
>
> Kyte is a statically typed language for server-side and hypermedia
> applications. Compiler and toolchain: https://github.com/kytelang
>
> - **Extensions:** `.ky`, `.kyx` (`.kyx` is the NSX hypermedia dialect).
> - **Grammar:** github.com/kytelang/kyte-vscode-extension, `source.ky`,
>   Apache-2.0.
> - **Samples:** taken from the Kyte standard library and the Kynator control
>   plane, both Apache-2.0 licensed. They are production modules, not tutorials.
> - **Usage:** <paste code-search links for `extension:ky` / `extension:kyx`
>   showing file counts and repository breadth here>.
>
> Extension `.ky`/`.kyx` and the name "Kyte" are currently unclaimed in
> languages.yml.

## Checklist before opening the PR

- [ ] `extension:ky` + `extension:kyx` clear the ~2000-files / many-repos bar.
- [ ] `.ky`, `.kyx`, and "Kyte" still unclaimed in `languages.yml`.
- [ ] Grammar added via `script/add-grammar`, analysis clean.
- [ ] Five samples copied to `samples/Kyte/`.
- [ ] `script/update-ids` run, id committed.
- [ ] `bundle exec rake test` green.
- [ ] PR description filled in with live usage links.
