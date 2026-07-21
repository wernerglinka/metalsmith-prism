# Theory of Operation

This document explains how `metalsmith-prism` works and why it is built the
way it is. The README covers usage; this covers design.

## Problem

Prism.js highlights code by transforming a plain code string into HTML with
`<span class="token …">` markup, driven by a language grammar. In a Metalsmith
build the code already lives inside generated HTML files (typically emitted by
a Markdown step), each `<code class="language-x">` block holding the raw
source. This plugin walks those HTML files, runs Prism over each code block,
and writes the highlighted markup back — so highlighting happens at build time
and the browser only needs the Prism CSS, not the Prism runtime.

## Approach

For every HTML file, the plugin parses the contents with Cheerio, finds each
`<code>` element carrying a `language-*` class, highlights its text with the
matching Prism grammar, and replaces the element's inner HTML with the result.
The parent `<pre>` gets the same language class (and, optionally, the
`line-numbers` class and its row markup).

Key decisions:

- **HTML files only.** Files are filtered by extension (`.html`/`.htm`); the
  plugin runs after Markdown-to-HTML, not before.
- **Cheerio with `decodeEntities: false`.** The DOM is manipulated without
  Cheerio re-encoding entities, so the plugin controls entity handling itself
  via the `decode` option and `he`.
- **On-demand grammar loading.** Prism grammars are loaded lazily the first
  time a language is seen, tracked in a `Set` so each grammar loads once.
  Unknown languages fall back to `markup`.

## Language loading

PHP is always loaded up front (it is a common case and its grammar has
historically needed explicit registration). Languages named in `preLoad` are
registered eagerly in array order — this matters because some grammars extend
others and must register after their base. Any other language is loaded on
first encounter. A load failure is logged (via `debug` and `console.warn`) and
the block falls back to `markup` rather than failing the build, because one
unsupported language should not break an otherwise valid site.

## Line numbers

When `lineNumbers` is enabled, a Prism `after-tokenize` hook counts lines and
builds the `line-numbers-rows` span markup. The hook is registered **at most
once per plugin instance** (guarded by a boolean), because Prism hooks are
global: repeated builds in watch mode would otherwise stack duplicate hooks and
emit duplicated row markup.

## Invariants and failure modes

- **Buffer contents.** Each file's `contents` is checked with
  `Buffer.isBuffer` before processing; non-Buffer or missing contents are
  skipped with a debug note.
- **Only rewrites when something changed.** A file's contents are rewritten
  only if at least one block was highlighted, avoiding needless buffer churn.
- **Errors propagate.** The per-file loop runs inside try/catch; any throw is
  logged and routed to `done(error)` so the build fails loudly.
- **Options are copied, not mutated.** Defaults are merged into a fresh `opts`
  object per invocation; the caller's options object is never mutated.
- **Idempotent hook registration.** The line-numbers hook guard keeps repeated
  runs of the same instance from compounding global Prism state.
