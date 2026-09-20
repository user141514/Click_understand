# Click_understand

A deliberately narrow Chrome MV3 extension for ChatGPT.

## What it does

It owns exactly one browser-side recovery action:

1. a ChatGPT popup contains the known request-rate text `请求过于频繁`;
2. exactly one enabled button inside that popup is labelled `明白了`;
3. the extension clicks that button once.

Everything else is a no-op.

## What it does not do

It does **not**:

- create or close tabs;
- navigate conversations or Projects;
- type prompts;
- click Send;
- switch models or thinking strength;
- read completion state;
- own Watchdog or Sidecar state.

This keeps it orthogonal to OMP Browser Relay, Watchdog and Conversation Sidecar.

## Install in Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the repository root:

   `/home/ad/gitproject/Click_understand`

If the Linux file picker hides a directory, press `Ctrl+H` to show hidden files. You can also press `Ctrl+L` and paste an absolute path.

Prefer loading the repository root directly. If you instead load a copied/staged directory, that directory becomes part of the runtime contract and must continue to exist.

After reloading this extension in `chrome://extensions`, refresh any ChatGPT tabs that were already open. Chrome does not retroactively recreate a freshly loaded content script inside an old document, so an existing tab can retain the pre-reload behavior until navigation or refresh.

## Known failure modes

### Registered unpacked path exists in Chrome, but the directory is gone

This failure was observed on 2026-09-20. Chrome still had Popup Guard registered with the expected `https://chatgpt.com/*` host access, but the recorded unpacked extension path pointed to a directory that no longer existed. The source repository itself was intact.

Symptom: the extension can still appear to be configured in the browser profile while no usable `manifest.json` or `popup-guard.js` exists at the path Chrome is actually loading.

Check the path shown for the unpacked extension in `chrome://extensions`. It must contain both:

- `manifest.json`
- `popup-guard.js`

Restore that exact directory or remove/reload the unpacked extension from the repository root. Then reload the extension and refresh already-open ChatGPT tabs.

### Only an old ChatGPT tab still behaves incorrectly after extension reload

A tab that was already open before the extension reload may still be running the previous document state. Refresh that tab once before treating it as evidence that the current Popup Guard build failed.

### ChatGPT popup signature changed

The matcher intentionally requires both the known popup text and the exact dismiss label. If ChatGPT changes either one, the guard must remain a no-op until the signature is deliberately updated and tested.

## Verify

```bash
node --test popup-guard.test.mjs
```

## Current popup signature

- popup text: `请求过于频繁`
- dismiss button: `明白了`

The rule is intentionally narrow. If ChatGPT changes the popup text or button label, update the rule instead of broadening the extension into general browser automation.
