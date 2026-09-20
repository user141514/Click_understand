;(() => {
  if (globalThis.__chatgptPopupGuardInstalled) return
  globalThis.__chatgptPopupGuardInstalled = true

  const POPUP_TEXT = '请求过于频繁'
  const DISMISS_TEXT = '明白了'
  const clicked = new WeakSet()
  let scanScheduled = false

  function normalizedText(value) {
    return String(value ?? '').replace(/\s+/g, ' ').trim()
  }

  function buttonLabel(button) {
    return normalizedText(
      button?.getAttribute?.('aria-label') ||
      button?.getAttribute?.('title') ||
      button?.textContent
    )
  }

  function popupContainer(button) {
    let node = button?.parentElement ?? null
    for (let depth = 0; node && depth < 8; depth += 1, node = node.parentElement) {
      if (node === document.body || node === document.documentElement) break
      const text = normalizedText(node.textContent)
      if (!text.includes(POPUP_TEXT)) continue
      const role = node.getAttribute?.('role')
      const ariaModal = node.getAttribute?.('aria-modal')
      if (role === 'dialog' || ariaModal === 'true') return node

      const buttons = node.querySelectorAll?.('button')
      if (buttons && [...buttons].includes(button)) return node
    }
    return null
  }

  function dismissKnownPopup() {
    const candidates = [...document.querySelectorAll('button')].filter((button) => {
      if (button?.disabled || button?.getAttribute?.('aria-disabled') === 'true') return false
      if (buttonLabel(button) !== DISMISS_TEXT) return false
      if (clicked.has(button)) return false
      return Boolean(popupContainer(button))
    })

    if (candidates.length !== 1) return false

    const [button] = candidates
    clicked.add(button)
    button.click()
    return true
  }

  function scheduleScan() {
    if (scanScheduled) return
    scanScheduled = true
    queueMicrotask(() => {
      scanScheduled = false
      dismissKnownPopup()
    })
  }

  dismissKnownPopup()

  const observer = new MutationObserver(scheduleScan)
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  })
})()
