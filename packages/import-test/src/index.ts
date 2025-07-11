import { index } from '@jkomyno/exported-pkg'
import { client } from '@jkomyno/exported-pkg/client'
import { runtime } from '@jkomyno/exported-pkg/runtime'

const main = async () => {
	const fs = await import('node:fs/promises')
	const pkg = await fs.readFile('package.json', 'utf8')
	JSON.parse(pkg) as { version: string }

	const value = {
		index,
		client,
		runtime,
		// version,
	}

	console.log(JSON.stringify(value))
}

main().catch((error) => {
	console.error('Error:', error)
	process.exit(1)
})
