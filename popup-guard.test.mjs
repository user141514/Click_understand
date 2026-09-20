import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'

const source = await readFile(new URL('./popup-guard.js', import.meta.url), 'utf8')

function makeFixture({
  popupText = '请求过于频繁',
  buttonLabels = ['明白了']
} = {}) {
  let observerCallback = null
  const clicks = []

  const dialog = {
    textContent: `${popupText} ${buttonLabels.join(' ')}`,
    parentElement: null,
    getAttribute(name) {
      if (name === 'role') return 'dialog'
      if (name === 'aria-modal') return 'true'
      return null
    },
    querySelectorAll(selector) {
      return selector === 'button' ? buttons : []
    }
  }

  const buttons = buttonLabels.map((label, index) => ({
    disabled: false,
    textContent: label,
    parentElement: dialog,
    getAttribute(name) {
      if (name === 'aria-label') return label
      if (name === 'aria-disabled') return 'false'
      return null
    },
    click() {
      clicks.push(index)
    }
  }))

  const document = {
    body: { textContent: '', parentElement: null },
    documentElement: { textContent: '', parentElement: null },
    querySelectorAll(selector) {
      return selector === 'button' ? buttons : []
    }
  }

  class MutationObserver {
    constructor(callback) {
      observerCallback = callback
    }

    observe() {}
  }

  const context = {
    document,
    MutationObserver,
    WeakSet,
    String,
    Boolean,
    queueMicrotask,
    globalThis: null
  }
  context.globalThis = context

  vm.createContext(context)
  vm.runInContext(source, context, { filename: 'popup-guard.js' })

  return {
    clicks,
    triggerMutation() {
      observerCallback?.([])
    }
  }
}

test('clicks the single 明白了 button inside the known request-rate popup', async () => {
  const fixture = makeFixture()
  await new Promise((resolve) => queueMicrotask(resolve))
  assert.deepEqual(fixture.clicks, [0])
})

test('does nothing when the request-rate popup signature is absent', async () => {
  const fixture = makeFixture({ popupText: '这是其他提示' })
  await new Promise((resolve) => queueMicrotask(resolve))
  assert.deepEqual(fixture.clicks, [])
})

test('does nothing when more than one matching 明白了 button exists', async () => {
  const fixture = makeFixture({ buttonLabels: ['明白了', '明白了'] })
  await new Promise((resolve) => queueMicrotask(resolve))
  assert.deepEqual(fixture.clicks, [])
})

test('does nothing for a different confirmation button', async () => {
  const fixture = makeFixture({ buttonLabels: ['知道了'] })
  await new Promise((resolve) => queueMicrotask(resolve))
  assert.deepEqual(fixture.clicks, [])
})

test('observes later DOM changes without clicking the same button twice', async () => {
  const fixture = makeFixture()
  await new Promise((resolve) => queueMicrotask(resolve))
  fixture.triggerMutation()
  await new Promise((resolve) => queueMicrotask(resolve))
  assert.deepEqual(fixture.clicks, [0])
})
