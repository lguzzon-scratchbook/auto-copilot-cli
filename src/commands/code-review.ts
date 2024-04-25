import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import { LLMCodeReview } from '../llm'
import { Command } from '../types'
import { gitDiffFiles } from '../utils/git'

export class CodeReviewCommand extends Command {
  async execute(message: string, options: { yes?: string }): Promise<void> {
    const diffFiles = await gitDiffFiles()
    if (diffFiles.length === 0) {
      console.log(
        `${chalk.red(
          '✘'
        )} No files to review, use git add to add files to review`
      )
      return
    }

    console.log(`${chalk.green('✔')} Found ${diffFiles.length} files to review`)

    const logPath = path.resolve(process.cwd(), 'review.log')
    const writeStream = fs.createWriteStream(logPath, { flags: 'a' })

    console.log(
      `${chalk.green('✔')} ${chalk.yellow(
        'Writing review log to'
      )} ${logPath}\n`
    )

    for (const file of diffFiles) {
      console.log(`${chalk.green('✔')} ${chalk.yellow('Reviewing')} ${file}`)

      const filePath = path.resolve(process.cwd(), file)
      const content = fs.readFileSync(filePath, 'utf-8')

      if (content === '') {
        console.log(`${chalk.red('✘')} ${chalk.yellow('Skip empty file')}`)
        continue
      }

      if (content.length > 10000) {
        console.log(`${chalk.red('✘')} ${chalk.yellow('Skip large file')}`)
        continue
      }

      await LLMCodeReview.codeReview({
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
        handleLLMNewToken: async (token: string) => {
          process.stdout.write(token)
          writeStream.write(token)
        }
      })
    }
  }
}
