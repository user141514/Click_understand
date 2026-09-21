import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'

const manifest = JSON.parse(
  await readFile(new URL('./manifest.json', import.meta.url), 'utf8')
)

const backgroundSource = await readFile(
  new URL('./background.js', import.meta.url),
  'utf8'
).catch(() => '')

test('extension startup backfills Popup Guard into already-open ChatGPT tabs', async () => {
  const queries = []
  const injections = []

  const chrome = {
    tabs: {
      async query(filter) {
        queries.push(filter)
        return [{ id: 11 }, { id: 22 }, { id: undefined }]
      }
    },
    scripting: {
      async executeScript(details) {
        injections.push(details)
      }
    }
  }

  const context = {
    chrome,
    Promise,
    globalThis: null
  }
  context.globalThis = context

  vm.createContext(context)
  vm.runInContext(backgroundSource, context, { filename: 'background.js' })

  await new Promise((resolve) => setTimeout(resolve, 0))

  assert.equal(manifest.background?.service_worker, 'background.js')
  assert.ok(manifest.permissions?.includes('scripting'))
  assert.ok(manifest.host_permissions?.includes('https://chatgpt.com/*'))
  assert.equal(
    JSON.stringify(queries),
    JSON.stringify([{ url: 'https://chatgpt.com/*' }])
  )
  assert.equal(
    JSON.stringify(injections),
    JSON.stringify([
      {
        target: { tabId: 11 },
        files: ['popup-guard.js']
      },
      {
        target: { tabId: 22 },
        files: ['popup-guard.js']
      }
    ])
  )
})
