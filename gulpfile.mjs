import { series } from 'gulp'
import { rm } from 'fs/promises'
import fs from 'fs/promises'
import { rollup } from 'rollup'
import { loadConfigFile } from 'rollup/loadConfigFile'
import { copy } from 'fs-extra'

export async function clear(cb) {
    await rm('./dist', { recursive: true, force: true })
    cb()
}
async function createRootPackageFile(cb) {
    const n = JSON.parse(await fs.readFile('./package.json', 'utf8'))
    const packageFile = {
        name: n.name,
        version: n.version,
        type: "commonjs",
        license: n.license,
        author: n.author,
        dependencies: n.dependencies
    }
    await fs.writeFile('./dist/package.json', JSON.stringify(packageFile, undefined, 2))
}

async function copyFile() {
    copy('./start-ui.js', './dist/start-ui.js')
    copy('./project.json', './dist/project.json')
    copy('./static', './dist/static')
}

export const build = series(
    clear,
    async function rollupBuild(cb) {
        const { options, warnings } = await loadConfigFile('./rollup.config.mjs')
        warnings.flush()
        for (const option of options) {
            const bundle = await rollup(option)
            await Promise.all(option.output.map(bundle.write))
        }
    },
    createRootPackageFile,
    copyFile,
)