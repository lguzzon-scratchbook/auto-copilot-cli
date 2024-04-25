import * as readline from 'readline'
import { LLMCodeChat } from '../llm'
import { Command } from '../types'

export class CodeChatCommand extends Command {
  async execute(
    directory: string,
    options: {
      prompt?: string
    }
  ): Promise<void> {
    await LLMCodeChat.chat({
      config: this.config,
      directory,
      input: '',
      prompt: options.prompt,
      handleLLMStart: () => {
        readline.cursorTo(process.stdout, 0)
        process.stdout.write('🤖 ')
      },
      handleLLMEnd: () => {
        process.stdout.write('\n')
      },
      handleLLMError: () => {
        process.stdout.write('\n')
      },
      handleLLMNewToken: (token: string) => {
        process.stdout.write(token)
      }
    })
  }
}
