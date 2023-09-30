// Monaco Editor 的核心模块，包含了编辑器的全部功能和组件。
import 'monaco-editor/esm/vs/editor/editor.all.js'

// 提供用于辅助功能的支持，例如键盘导航和屏幕阅读器。
// import 'monaco-editor/esm/vs/editor/standalone/browser/accessibilityHelp/accessibilityHelp.js'
// 提供在 iPad 上显示虚拟键盘的支持。
// import 'monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.js'
// 提供在编辑器中检查标记（token）的支持，用于语法高亮和语言分析。
import 'monaco-editor/esm/vs/editor/standalone/browser/inspectTokens/inspectTokens.js'
// 提供快速访问帮助文档的支持。
// import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneHelpQuickAccess.js'
// 提供快速跳转到指定行的支持。
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoLineQuickAccess.js'
// 提供快速跳转到指定符号（函数、变量等）的支持。
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoSymbolQuickAccess.js'
// 提供快速执行编辑器命令的支持。
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess.js'
// 提供在编辑器中进行引用搜索的支持。
import 'monaco-editor/esm/vs/editor/standalone/browser/referenceSearch/standaloneReferenceSearch.js'

// 提供 TypeScript 语言支持的贡献模块。
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution'
// 提供 CSS 语言支持的贡献模块。
// import 'monaco-editor/esm/vs/language/css/monaco.contribution'
// 提供 JSON 语言支持的贡献模块。
// import 'monaco-editor/esm/vs/language/json/monaco.contribution'
// 提供 HTML 语言支持的贡献模块。
// import 'monaco-editor/esm/vs/language/html/monaco.contribution'
// 提供基本语言支持的贡献模块，包括常见的编程语言（如 JavaScript、Python）和标记语言（如 XML、Markdown）。
// import 'monaco-editor/esm/vs/basic-languages/monaco.contribution'
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution'
import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution'

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'

export { monaco }
