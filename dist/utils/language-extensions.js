var __importDefault =
  (this && this.__importDefault) ||
  ((mod) => (mod && mod.__esModule ? mod : { default: mod }))
Object.defineProperty(exports, '__esModule', { value: true })
exports.filterFilesByExtensions =
  exports.excludePackagesFiles =
  exports.extensions =
  exports.extensionsList =
  exports.excludePackagesFilesList =
  exports.programmingLanguageExtensions =
    void 0
const path_1 = __importDefault(require('path'))
exports.programmingLanguageExtensions = {
  Text: ['.txt'],
  JavaScript: ['.js', '.mjs'],
  TypeScript: ['.ts', '.tsx'],
  CSS: ['.css', '.scss', '.less'],
  HTML: ['.html', '.htm'],
  JSON: ['.json'],
  Python: ['.py'],
  Java: ['.java'],
  C: ['.c'],
  'C++': ['.cpp'],
  'C#': ['.cs'],
  Go: ['.go'],
  PHP: ['.php'],
  Ruby: ['.rb'],
  Rust: ['.rs'],
  Swift: ['.swift'],
  Kotlin: ['.kt'],
  Scala: ['.scala'],
  'Objective-C': ['.m', '.h'],
  Shell: ['.sh'],
  Perl: ['.pl', '.pm'],
  Lua: ['.lua'],
  SQL: ['.sql']
}
exports.excludePackagesFilesList = {
  JavaScript: ['package-lock.json', 'yarn.lock'],
  Python: ['requirements.txt'],
  Java: ['pom.xml'],
  Go: ['go.mod'],
  PHP: ['composer.json'],
  Ruby: ['Gemfile'],
  Rust: ['Cargo.toml'],
  Swift: ['Package.swift'],
  Kotlin: ['build.gradle'],
  Scala: ['build.sbt'],
  'Objective-C': ['Podfile'],
  Shell: ['package.json'],
  Perl: ['cpanfile'],
  Lua: ['rockspec']
}
exports.extensionsList = Object.values(
  exports.programmingLanguageExtensions
).flat()
exports.extensions = new Set(exports.extensionsList)
exports.excludePackagesFiles = new Set(
  Object.values(exports.excludePackagesFilesList).flat()
)
const filterFilesByExtensions = (files) => {
  return files.filter((file) =>
    exports.extensions.has(path_1.default.extname(file))
  )
}
exports.filterFilesByExtensions = filterFilesByExtensions
