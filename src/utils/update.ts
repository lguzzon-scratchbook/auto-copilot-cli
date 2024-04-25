import { exec } from 'child_process'
import { promisify } from 'util'
import chalk from 'chalk'
import ora from 'ora'
import semver from 'semver'
// @ts-ignore
import { name, version } from '../../package.json'

export async function checkUpdate() {
  const spinner = ora('Checking for updates').start()
  const execPromise = promisify(exec)
  const { stdout } = await execPromise('npm view auto-copilot-cli version')
  const latestVersion = semver.clean(stdout)
  if (!latestVersion) {
    spinner.fail(chalk.yellow('Could not check for updates'))
    return
  }
  if (semver.gt(latestVersion, version)) {
    spinner.fail(
      chalk.yellow(
        `Please update ${name} to the latest version: ${chalk.blue(
          'npm i -g auto-copilot-cli'
        )}`
      )
    )
  } else {
    spinner.stop()
  }
}
