var __importDefault =
  (this && this.__importDefault) ||
  ((mod) => (mod && mod.__esModule ? mod : { default: mod }))
Object.defineProperty(exports, '__esModule', { value: true })
exports.PreCommitCommand = void 0
const child_process_1 = require('child_process')
const util_1 = require('util')
const ora_1 = __importDefault(require('ora'))
const llm_1 = require('../llm')
const types_1 = require('../types')
const utils_1 = require('../utils')
const git_1 = require('../utils/git')
class PreCommitCommand extends types_1.Command {
  async execute(message, options) {
    const spinner = (0, ora_1.default)('Analyzing').start()
    try {
      const { config } = this
      const diff = await (0, git_1.gitDiffCommand)()
      if (!diff) {
        spinner.succeed('No diff found using git add')
        return
      }
      const { title, messages } = await llm_1.LLMPreCommit.preCommit({
        config,
        diff
      })
      spinner.stop()
      const commitBullets =
        messages?.map((message) => `- ${message}`).join('\n') ?? ''
      const fullCommitMessage = `"${title}${
        commitBullets ? `\n\n${commitBullets}` : ''
      }"`
      const shouldCommit = options.yes
        ? true
        : await (0, utils_1.askCommit)(fullCommitMessage)
      if (shouldCommit) {
        spinner.text = 'Committing'
        await (0, util_1.promisify)(child_process_1.exec)(
          `git commit -m ${fullCommitMessage}`
        )
        spinner.succeed('Successfully committed')
      } else {
        const shouldRetry = await (0, utils_1.askRetryCommit)()
        if (shouldRetry) await this.execute(message, options)
      }
    } catch (error) {
      spinner.fail('Failed to commit')
      throw error
    }
  }
}
exports.PreCommitCommand = PreCommitCommand
