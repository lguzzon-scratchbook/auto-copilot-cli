var __importDefault =
  (this && this.__importDefault) ||
  ((mod) => (mod && mod.__esModule ? mod : { default: mod }))
Object.defineProperty(exports, '__esModule', { value: true })
exports.CodeReviewCommand = void 0
const fs_1 = __importDefault(require('fs'))
const path_1 = __importDefault(require('path'))
const chalk_1 = __importDefault(require('chalk'))
const llm_1 = require('../llm')
const types_1 = require('../types')
const git_1 = require('../utils/git')
class CodeReviewCommand extends types_1.Command {
  async execute(message, options) {
    const diffFiles = await (0, git_1.gitDiffFiles)()
    if (diffFiles.length === 0) {
      console.log(
        `${chalk_1.default.red(
          '✘'
        )} No files to review, use git add to add files to review`
      )
      return
    }
    console.log(
      `${chalk_1.default.green('✔')} Found ${diffFiles.length} files to review`
    )
    const logPath = path_1.default.resolve(process.cwd(), 'review.log')
    const writeStream = fs_1.default.createWriteStream(logPath, { flags: 'a' })
    console.log(
      `${chalk_1.default.green('✔')} ${chalk_1.default.yellow(
        'Writing review log to'
      )} ${logPath}\n`
    )
    for (const file of diffFiles) {
      console.log(
        `${chalk_1.default.green('✔')} ${chalk_1.default.yellow(
          'Reviewing'
        )} ${file}`
      )
      const filePath = path_1.default.resolve(process.cwd(), file)
      const content = fs_1.default.readFileSync(filePath, 'utf-8')
      if (content === '') {
        console.log(
          `${chalk_1.default.red('✘')} ${chalk_1.default.yellow(
            'Skip empty file'
          )}`
        )
        continue
      }
      if (content.length > 10000) {
        console.log(
          `${chalk_1.default.red('✘')} ${chalk_1.default.yellow(
            'Skip large file'
          )}`
        )
        continue
      }
      await llm_1.LLMCodeReview.codeReview({
        config: this.config,
        content,
        filePath,
        handleLLMStart: async () => {
          process.stdout.write('\n')
        },
        handleLLMEnd: async () => {
          process.stdout.write('\n')
        },
        handleLLMError: async () => {
          process.stdout.write('\n')
        },
        handleLLMNewToken: async (token) => {
          process.stdout.write(token)
          writeStream.write(token)
        }
      })
    }
  }
}
exports.CodeReviewCommand = CodeReviewCommand
