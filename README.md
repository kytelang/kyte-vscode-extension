# Kyte Language for VS Code

Editor support for [Kyte](https://github.com/kytelang), a modern, statically typed programming language for building server side services and hypermedia applications. Kyte pairs familiar ES6 and TypeScript style syntax with a fast native runtime, first class async and await, and a standard library written in Kyte itself.

## Features

This is a 1.0 release. The extension pairs with version 1.0.0 of the `kynalyzer` language server, and the two
versions move together.

### In the editor

- **Syntax highlighting** for `.ky` and `.kyx` (NSX hypermedia templates), including hex, octal, binary and
  exponent number literals and the `match` and `class` keywords.
- **Language configuration**: bracket matching, auto-closing pairs, and comment toggling.
- **Snippets** for `class`, `enum`, `trait`, `impl`, `let`, `const`, `switch`, `match`, `async fn`, `await`,
  `spawn`, `try`/`catch`, imports, and an NSX element.
- **File icons** for Kyte sources in icon themes that opt in.
- **Run the current file** with `Ctrl+Shift+R` (command: "Kyte: Run Current File").
- **Restart the language server** with the command "Kyte: Restart Language Server".

### From the language server

The server reuses the real Kyte compiler frontend, so its analysis never drifts from the compiler:

- **Diagnostics** from the actual type checker, resolving the project import closure.
- **Completion** (members, identifiers, keywords) with signature help and lazy resolve.
- **Hover** with documentation comments.
- **Navigation**: go to definition, go to type definition, and go to implementation (list the types that
  implement a trait).
- **Project-wide, binding-accurate references and rename.** A rename edits every file in the import closure,
  not just open buffers, and it is type-aware: renaming a method never touches a same-named method on an
  unrelated type, and renaming a global never clobbers a shadowing local.
- **Document and workspace symbols** for outline and quick navigation.
- **Document highlight**, **folding ranges**, and **selection ranges** (smart expand selection).
- **Semantic tokens** (whole document and by range) with a `declaration` modifier so themes can tell a
  definition from a use.
- **Inlay hints**: the inferred type of an annotation-free `let`, and parameter names shown before call
  arguments.
- **Formatting** that mirrors `kyte fmt` behind a safety gate, and **quick fixes** driven by diagnostics.

## Getting started

1. Install the extension.
2. Open any `.ky` or `.kyx` file. Highlighting applies automatically.
3. For diagnostics and go to definition, install the Kyte toolchain so the `kynalyzer` language server is
   present. The extension finds the server in this order: the `kyte.server.path` setting (if set), then
   `kynalyzer` on your `PATH`, then the default install location `~/.kyte/bin/kynalyzer`. If none is found,
   highlighting still works and a one-time message explains how to enable the rest.

## Settings

- `kyte.server.enabled` (default `true`): turn the language server on or off. When off, highlighting, icons
  and the run command still work.
- `kyte.server.path` (default empty): explicit path to the `kynalyzer` binary; a leading `~` is expanded.
- `kyte.trace.server` (`off` | `messages` | `verbose`): trace LSP traffic in the output channel.

## About Kyte

Kyte is a modern, high level, statically typed language designed for server side and hypermedia work. It combines familiar ES6 and TypeScript style syntax with a native toolchain, first class async and await, an actor model built on channels, and a rich standard library. Learn more at the [Kyte project on GitHub](https://github.com/kytelang).

## Licence

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE).
