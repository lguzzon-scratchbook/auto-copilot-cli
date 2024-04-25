var __importDefault =
  (this && this.__importDefault) ||
  ((mod) => (mod && mod.__esModule ? mod : { default: mod }))
Object.defineProperty(exports, '__esModule', { value: true })
exports.checkUpdate = void 0
const child_process_1 = require('child_process')
const util_1 = require('util')
const chalk_1 = __importDefault(require('chalk'))
const ora_1 = __importDefault(require('ora'))
const semver_1 = __importDefault(require('semver'))
// @ts-ignore
const package_json_1 = require('../../package.json')
async function checkUpdate() {
  const spinner = (0, ora_1.default)('Checking for updates').start()
  const execPromise = (0, util_1.promisify)(child_process_1.exec)
  const { stdout } = await execPromise('npm view auto-copilot-cli version')
  const latestVersion = semver_1.default.clean(stdout)
  if (!latestVersion) {
    spinner.fail(chalk_1.default.yellow('Could not check for updates'))
    return
  }
  if (semver_1.default.gt(latestVersion, package_json_1.version)) {
    spinner.fail(
      chalk_1.default.yellow(
        `Please update ${
          package_json_1.name
        } to the latest version: ${chalk_1.default.blue(
          'npm i -g auto-copilot-cli'
        )}`
      )
    )
  } else {
    spinner.stop()
  }
}
exports.checkUpdate = checkUpdate
