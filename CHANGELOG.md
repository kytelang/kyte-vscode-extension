# Changelog

All notable changes to the Kyte VS Code extension are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/), and the extension version tracks the `kynalyzer` language
server version at each release.

## [1.0.0]

First stable release. The extension pairs with `kynalyzer` 1.0.0; both versions move together.

### Added
- Language-server client hardening: the server is discovered via `kyte.server.path`, then `PATH`, then
  `~/.kyte/bin/kynalyzer`; a missing server no longer errors, it shows one actionable message and leaves
  highlighting, icons and the run command working.
- Settings: `kyte.server.enabled`, `kyte.server.path`, `kyte.trace.server`.
- Command "Kyte: Restart Language Server" (`kyte.restartServer`).
- Snippets for `class`, `enum`, `trait`, `impl`, `let`, `const`, `switch`, `match`, `async fn`, `await`,
  `spawn`, `try`/`catch`, and an NSX element for `.kyx`.

### Changed
- Grammar: added the `match` and `class` keywords, and hex / octal / binary / exponent numeric literals.
- Fixed the `import` snippet to the real `import module;` form.

### Fixed
- README now describes the actual server-discovery order.

### Dev
- eslint config, a `package` script, and a CI workflow (compile + lint + `vsce package`).

## [0.1.0]

### Added
- Syntax highlighting for `.ky` and `.kyx` (NSX hypermedia templates).
- Language configuration (brackets, comments, auto-closing pairs).
- File icons for `.ky` / `.kyx`.
- Initial snippets and a "Run Current File" command.
- Language-server integration with `kynalyzer` (diagnostics, completion, hover, navigation, symbols,
  formatting).
