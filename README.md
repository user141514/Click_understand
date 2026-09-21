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

As of v0.2.0, the background service worker backfills `popup-guard.js` into ChatGPT tabs that were already open when the extension starts or is reloaded. A manual page refresh should no longer be required just to activate Popup Guard in an old document.

## Known failure modes

### Correct source verified on the wrong host or Chrome profile

A passing source test or a working browser probe on one machine does not prove that the target browser instance has Popup Guard installed. Treat deployment identity as the tuple:

`host + Chrome profile + unpacked extension path`

Before changing the matcher, verify the failing tab belongs to the same browser instance/profile where Popup Guard is registered. If the target profile has no Popup Guard entry at all, fix deployment first; source-level changes cannot affect that browser.

This failure was observed when the real failing ChatGPT tab lived on a different host from the browser instance used for the initial Popup Guard verification. The live popup DOM itself still matched the existing rule exactly; the target Chrome profile simply had no Popup Guard registration.

### Registered unpacked path exists in Chrome, but the directory is gone

This failure was observed on 2026-09-20. Chrome still had Popup Guard registered with the expected `https://chatgpt.com/*` host access, but the recorded unpacked extension path pointed to a directory that no longer existed. The source repository itself was intact.

Symptom: the extension can still appear to be configured in the browser profile while no usable `manifest.json` or `popup-guard.js` exists at the path Chrome is actually loading.

Check the path shown for the unpacked extension in `chrome://extensions`. It must contain both:

- `manifest.json`
- `popup-guard.js`

Restore that exact directory or remove/reload the unpacked extension from the repository root. Then reload the extension and refresh already-open ChatGPT tabs.

### Only an old ChatGPT tab still behaves incorrectly after extension reload

Versions before v0.2.0 relied only on declarative content scripts, so tabs opened before installation/reload could keep running without Popup Guard until navigation or refresh. v0.2.0 closes that lifecycle gap by having the extension service worker inject the same guard into already-open ChatGPT tabs when the extension starts.

If an old tab still fails on v0.2.0, first verify that the target host/profile is actually running v0.2.0 before changing the popup matcher.

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
