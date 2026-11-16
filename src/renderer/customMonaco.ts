// Importing `monaco-editor`'s default entrypoint pulls in every language it
// ships — including things like ABAP, Solidity, and three different SQL
// dialects we never use — bloating the renderer bundle by a couple of
// megabytes for nothing. Import only the editor core plus the specific
// languages `detectLanguage.ts` actually maps to, using the lightweight
// "basic-languages" Monarch tokenizers (syntax highlighting only — no
// IntelliSense/validation workers, which this app has no use for as a
// remote file viewer rather than an IDE). JSON has no basic-languages
// variant, so it's the one exception pulling in its full language service.
import 'monaco-editor/esm/vs/editor/editor.all.js'

import 'monaco-editor/esm/vs/basic-languages/ini/ini.contribution'
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution'
import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution'
import 'monaco-editor/esm/vs/basic-languages/shell/shell.contribution'
import 'monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution'
import 'monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution'
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution'
import 'monaco-editor/esm/vs/basic-languages/css/css.contribution'
import 'monaco-editor/esm/vs/basic-languages/scss/scss.contribution'
import 'monaco-editor/esm/vs/basic-languages/html/html.contribution'
import 'monaco-editor/esm/vs/basic-languages/xml/xml.contribution'
import 'monaco-editor/esm/vs/basic-languages/sql/sql.contribution'
import 'monaco-editor/esm/vs/basic-languages/ruby/ruby.contribution'
import 'monaco-editor/esm/vs/basic-languages/go/go.contribution'
import 'monaco-editor/esm/vs/basic-languages/rust/rust.contribution'
import 'monaco-editor/esm/vs/basic-languages/java/java.contribution'
import 'monaco-editor/esm/vs/basic-languages/php/php.contribution'

import 'monaco-editor/esm/vs/language/json/monaco.contribution'

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'

export { monaco }
