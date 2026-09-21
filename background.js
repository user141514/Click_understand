;(() => {
  const CHATGPT_URL = 'https://chatgpt.com/*'

  async function backfillOpenTabs() {
    const tabs = await chrome.tabs.query({ url: CHATGPT_URL })

    await Promise.allSettled(
      tabs
        .filter((tab) => Number.isInteger(tab.id))
        .map((tab) =>
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['popup-guard.js']
          })
        )
    )
  }

  void backfillOpenTabs()
})()
