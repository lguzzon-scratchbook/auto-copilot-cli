var __importDefault =
  (this && this.__importDefault) ||
  ((mod) => (mod && mod.__esModule ? mod : { default: mod }))
Object.defineProperty(exports, '__esModule', { value: true })
exports.gitFiles =
  exports.gitDiffFiles =
  exports.gitDiffCommand =
  exports.getGitIgnoreFiles =
  exports.checkGitExists =
    void 0
const chalk_1 = __importDefault(require('chalk'))
const simple_git_1 = __importDefault(require('simple-git'))
const language_extensions_1 = require('./language-extensions')
const git = (0, simple_git_1.default)()
async function checkGitExists() {
  const gitExists = await git.checkIsRepo()
  if (!gitExists) {
    console.error(`${chalk_1.default.red('✘')} need to be in a git repository`)
    process.exit(1)
  }
}
exports.checkGitExists = checkGitExists
async function getGitIgnoreFiles() {
  const gitIgnoreFiles = await git.raw([
    'ls-files',
    '--others',
    '--exclude-standard',
    '-i',
    '--directory',
    '--cached'
  ])
  return gitIgnoreFiles.split('\n').filter(Boolean)
}
exports.getGitIgnoreFiles = getGitIgnoreFiles
async function gitDiffCommand() {
  const exts = Array.from(
    language_extensions_1.extensions.values(),
    (ext) => `*${ext}`
  )
  const excludeFiles = Array.from(
    language_extensions_1.excludePackagesFiles.values()
  )
  const gitIgnoreFiles = await getGitIgnoreFiles()
  return git.diff([
    '--cached',
    '--diff-filter=ACMRT',
    '--',
    ...exts,
    ...excludeFiles.map((file) => `:(exclude)${file}`),
    ...gitIgnoreFiles.map((file) => `:(exclude)${file}`)
  ])
}
exports.gitDiffCommand = gitDiffCommand
async function gitDiffFiles() {
  const exts = Array.from(
    language_extensions_1.extensions.values(),
    (ext) => `*${ext}`
  )
  const excludeFiles = Array.from(
    language_extensions_1.excludePackagesFiles.values()
  )
  const gitIgnoreFiles = await getGitIgnoreFiles()
  const raw = await git.diff([
    '--name-only',
    '--cached',
    '--diff-filter=ACMRT',
    '--',
    ...exts,
    ...excludeFiles.map((file) => `:(exclude)${file}`),
    ...gitIgnoreFiles.map((file) => `:(exclude)${file}`)
  ])
  return raw.split('\n').filter(Boolean)
}
exports.gitDiffFiles = gitDiffFiles
async function gitFiles() {
  const exts = Array.from(
    language_extensions_1.extensions.values(),
    (ext) => `*${ext}`
  )
  const excludeFiles = Array.from(
    language_extensions_1.excludePackagesFiles.values()
  )
  const gitIgnoreFiles = await getGitIgnoreFiles()
  const raw = await git.raw([
    'ls-files',
    '--cached',
    '--others',
    '--exclude-standard',
    '--',
    ...exts,
    ...excludeFiles.map((file) => `:(exclude)${file}`),
    ...gitIgnoreFiles.map((file) => `:(exclude)${file}`)
  ])
  return raw.split('\n').filter(Boolean)
}
exports.gitFiles = gitFiles
