import { exec } from 'child_process'
import fs from 'fs'
import chalk from 'chalk'
import ora from 'ora'
import { LLMCode } from '../llm'
import { Command } from '../types'
import { askOpenEditor, askTest, inputTest } from '../utils'

export class TestCommand extends Command {
  async execute(
    path: string,
    {
      prompt,
      output
    }: {
      prompt?: string
      output?: string
    }
  ): Promise<void> {
    if (!fs.existsSync(path)) {
      console.error(`${chalk.red('✘')} no such file or directory: ${path}`)
      return
    }

    const fileType = path.split('.').pop()
    if (!fileType) {
      console.error(`${chalk.red('✘')} invalid file type: ${path}`)
      return
    }

    output = output || path.replace(`.${fileType}`, `.test.${fileType}`)
    const questionOpenCode = await askOpenEditor()
    if (questionOpenCode) {
      exec(`${this.config.EDITOR || 'code'} ${output}`)
    }

    const spinner = ora('Generating tests')
    const content = fs.readFileSync(path, 'utf-8')
    const handleLLMStart = () => spinner.start()
    const handleLLMEnd = () => spinner.succeed('Successfully generated tests')
    const handleLLMError = () => spinner.fail()

    await LLMCode.generateTest({
      config: this.config,
      content,
      prompt: prompt,
      output: output,
      handleLLMStart,
      handleLLMEnd,
      handleLLMError
    })

    const answer = await askTest()
    if (answer) {
      prompt = await inputTest()
      await this.execute(output, {
        prompt,
        output
      })
    }
  }
}
