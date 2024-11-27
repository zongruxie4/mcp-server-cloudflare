// Shell out to `npx wrangler@latest whoami`
import { exec } from 'child_process'
import { promisify } from 'util'
import {
  AuthTokens, fetchInternal,
  getAuthTokens,
  isAccessTokenExpired,
  refreshToken
} from './utils/wrangler'
import chalk from 'chalk'

const execAsync = promisify(exec)

export async function init(args: string[]) {
  try {
    getAuthTokens()
  } catch (e: any) {
    console.log(
      `Caught error while reading Wrangler auth info:\n  ${chalk.gray(e.message)}\n${chalk.yellow(`Running 'wrangler login' and retrying...`)}`,
    )

    await execAsync('npx wrangler@latest login')
    getAuthTokens()
  }

  if (isAccessTokenExpired()) {
    if (await refreshToken()) {
      console.log('Successfully refreshed access token')
    } else {
      console.log('Failed to refresh access token')
    }
  }

  console.log(await fetchInternal("/accounts"))

}
