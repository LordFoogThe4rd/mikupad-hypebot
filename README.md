# Mikupad Hypebot Userscript

This userscript adds a configurable, AI-powered "Hypebot" to the [Mikupad](https://github.com/lmg-anon/mikupad) writing application. The Hypebot provides meta-commentary on your story as you write, similar to the feature found in NovelAI.

## Features

*   Adds a Hypebot comment box to the Mikupad interface.
*   Periodically generates comments on your writing using an AI model.
*   Connects to any OpenAI-compatible API endpoint (e.g., OpenRouter, a local LLM server).
*   Highly configurable through an integrated settings menu.
*   Customizable system prompt to define the Hypebot's personality and task.
*   Adjustable comment frequency, context length, and generation parameters.
*   Customizable Hypebot name, avatar, and appearance.

## Installation

1.  You need a userscript manager for your browser. Common choices include:
    *   Tampermonkey (recommended)
    *   Greasemonkey
    *   Violentmonkey

2.  Install the script. You can do this by [clicking here](https://github.com/LordFoogThe4rd/mikupad-hypebot/raw/refs/heads/main/mikupad_hypebot.user.js)

3.  The script will automatically run when you visit a Mikupad page.

## Configuration

After installing the script, a new settings icon will appear on the left side of the main text area in Mikupad. Clicking this icon will open the "Hypebot Configuration" menu.

### Required Settings

*   **OpenAI-compatible Chat Completion Endpoint**: The URL for the API you want to use. This must be a chat completions endpoint that follows the OpenAI specification.
*   **API Key**: Your API key for the chosen service.
    *   **Warning**: This key is stored in plain text in your browser's local storage and is not secure. Use a key with strict usage limits and monitor it frequently.
*   **Model**: The identifier for the model you wish to use (e.g., `deepseek/deepseek-v3.2`).

### Key Settings

*   **System Prompt**: This is the core instruction that tells the AI how to behave. The default prompt instructs the AI to act as a meta-commentary generator and respond in a specific JSON format. You can edit this to change the Hypebot's personality, tone, and task.
    *   **Warning**: Currently, you must instruct the model to follow the specific JSON schema defined in the default prompt for the script to work. This may change in the future.
*   **Input Length**: The number of characters from the end of your story that will be sent to the AI as context.
*   **Min/Max Comment Interval**: The minimum and maximum time in seconds between Hypebot comments. A new interval is chosen randomly from this range after each comment.
*   **Avatar URL / Name**: Customize the appearance and name of your Hypebot.

## How It Works

The script periodically checks if you have written new text. If new text is detected, it takes a slice of the most recent content from your story (including memory, world info, and author's notes) and sends it to the specified AI model along with the system prompt. It then parses the AI's response and displays the generated comment in the Hypebot UI panel.

## Compatibility

This script is designed to run on:

*   The official Mikupad site: `https://lmg-anon.github.io/mikupad/mikupad.html`
*   Local instances of Mikupad (e.g., `localhost:3000`).


The script relies on the internal React structure of Mikupad to accurately construct the full context. Major updates to Mikupad may break this functionality.

