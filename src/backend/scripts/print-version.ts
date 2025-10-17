import { getAppInfo } from '../lib/app-info'

async function main () {
  const info = await getAppInfo()
  console.log(`${info.name}@${info.version}`)
}

void main()
