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

## Verify

```bash
node --test popup-guard.test.mjs
```

## Current popup signature

- popup text: `请求过于频繁`
- dismiss button: `明白了`

The rule is intentionally narrow. If ChatGPT changes the popup text or button label, update the rule instead of broadening the extension into general browser automation.
