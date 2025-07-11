import { index } from '@jkomyno/exported-pkg'
import { client } from '@jkomyno/exported-pkg/client'
import { runtime } from '@jkomyno/exported-pkg/runtime'

export const testImport = {
	async test() {
		const value = {
			index,
			client,
			runtime,
		}

		console.log(JSON.stringify(value))
	},
}
