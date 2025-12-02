// ==UserScript==
// @name         mikupad hypebot
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  add NovelAI-like hypebot feature to mikupad
// @include        *lmg-anon.github.io/mikupad/mikupad.html
// @include        *localhost:3000*
// @require            https://openuserjs.org/src/libs/sizzle/GM_config.js
// @grant              GM_getValue
// @grant              GM_setValue
// @grant              GM.getValue
// @grant              unsafeWindow
// @grant              GM.setValue
// ==/UserScript==

(function(){
    'use strict';
    
    //config
    let gmc = new GM_config({
        'id': 'HypebotConfig',
        'title': 'Hypebot Configuration',
        'fields': {
            'ChatCompletionURL':
            {
                'label': 'OpenAI-compatible Chat Completion Endpoint (/chat/completions)',
                'type': 'text',
                'default': 'https://openrouter.ai/api/v1/chat/completions'
            },
            'ApiKey':
            {
                'label': 'API Key (insecurely stored and unmasked!!! make sure to limit and monitor usage frequently)',
                'type': 'text',
                'default': ''
            },
            'Model':
            {
                'label': 'Model',
                'type': 'text',
                'default': 'deepseek/deepseek-v3.2' //todo: find a better model, new deepseek is too sloppy
            },
            'Temperature':
            {
                'label': 'Temperature',
                'type': 'number',
                'default': 1.3
            },
            'MaxOutput':
            {
                'label': 'Max Output',
                'type': 'number',
                'default': 100
            },
            'InputLength': {
                'label': 'Input Length (no. of characters from the end of your story to be included in the prompt)',
                'type': 'number',
                'default': 1200
            },
            'SystemPrompt': {
                'label': 'System Prompt',
                'type': 'textarea',
                'default': 'You are a meta-commentary generator. In the user message, you will be given an extract of a creative text. Your job is to generate a JSON object with two fields: "tone" and "comment". The "tone" field must contain the tone of the meta-commentary in a single word, i.e cynical, humorous,  concerned, sarcastic, etc. The "comment" field must contain a single sentence of meta-commentary with the aforementioned tone about the latest details/events in the story directed at the user, who is the author of the story.\nConstraints:\n- Use casual languagen\n- Profanity is allowed\n- Be creative and witty\n- The story may be cut off, so make do with the available context\n- Any tone of voice, negative or positive, is allowed\n- Avoid cliched responses and positivity bias\n\nExamples:\n{"tone": "sarcastic", "comment": "Wow! This must be really poor on your dick!"}\n{"tone": "lecturing", "comment": "You should obey your father\'s commands, even if they seem a little unfair."}\n{"tone": "criticizing", "comment": "But you shouldn\'t need space in a relationship."}\n{"tone": "encouraging", "comment": "Now that your life has been spared, let\'s make sure you really live to tell the tale!"}\n{"tone": "cautionary", "comment": "Maybe you should start keeping track of where your next meal is coming from..."}' //todo: make a better prompt, this one generates really sloppy comments (or maybe it's model's fault?)
            },
            'MinCommentInterval': {
                'label': 'Minimum interval between comments (in seconds)',
                'type': 'number',
                'default': 60             
            },
            'MaxCommentInterval': {
                'label': 'Maximum interval between comments (in seconds)',
                'type': 'number',
                'default': 120
            },
            'AvatarUrl': {
                'label': 'Hypebot Avatar URL (square preferred)',
                'type': 'text',
                'default': 'https://cdn.donmai.us/original/14/4e/144e625cf9c98139e851158492a1ea43.png'
            },
            'Name': {
                'label': 'Hypebot Name',
                'type': 'text',
                'default': 'ALLMIND'
            },
            'AvatarBackgroundColor': {
                'label': 'Hypebot Avatar Background Color (CSS color)',
                'type': 'text',
                'default': '#000000'
            }
        },
        'events': {
            'save': function() {
                const avatar = document.getElementById("avatar");
                avatar.style.backgroundColor = gmc.get('AvatarBackgroundColor');
                avatar.src = gmc.get('AvatarUrl');

                const name = document.getElementById("name");
                name.textContent = gmc.get('Name');
            }
        }
    });
    GM_config.init(gmc);
    
    function initializeHypebotUI() {
        //elements and styling
        //todo: make it look prettier
        const settingsBtn = document.createElement("button");
        settingsBtn.className = "textAreaSettings"; // Use className to set class
        settingsBtn.title = "Hypebot Settings";
        settingsBtn.style = "margin-top: 4.5em";
        // The settings icon from mikupad is an SVG, let's add it.
        settingsBtn.innerHTML = `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413-1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"></path></svg>`;
        const settingsReference = document.getElementById("prompt-area");
        settingsReference.insertAdjacentElement("beforebegin", settingsBtn);
        settingsBtn.onclick = () => gmc.open(); // Corrected onclick handler

        const hypebotContainer = document.createElement("div");
        hypebotContainer.id = "hypebot-container";
        hypebotContainer.style = 'align-items: flex-end; max-width: 30vw';
        const containerReference = document.getElementById("prompt-container");
        containerReference.insertAdjacentElement("beforebegin", hypebotContainer);

        const commentContainer = document.createElement("div");
        commentContainer.id = "comment-container";
        commentContainer.style = "max-height: 15vw; display: flex; flex-direction: row";
        hypebotContainer.appendChild(commentContainer);

        const avatar = document.createElement("img");
        avatar.src = gmc.get('AvatarUrl');
        avatar.style = 'width: 25%; aspect-ratio: 1/1';
        avatar.id = "avatar";
        avatar.style.backgroundColor = gmc.get('AvatarBackgroundColor');
        commentContainer.appendChild(avatar);

        const commentBox = document.createElement("div");
        commentBox.id = "comment-box";
        commentBox.style = "justify-content: start; background-color: var(--color-bg-ui-1); width: 75%";
        commentContainer.appendChild(commentBox);

        const name = document.createElement("div");
        name.id = "name";
        name.textContent = gmc.get('Name');
        name.style = "margin: 10px 10px; color: var(--color-text-ui); font-weight: bold";
        commentBox.appendChild(name);

        const commentText = document.createElement("div");
        commentText.id = "comment";
        commentText.style = "margin: 5px 10px; color: var(--color-text-ui)";
        commentBox.appendChild(commentText);
    }

    //functions
    function findReactInstance(domElement) {
        const key = Object.keys(domElement).find(k => k.startsWith("__reactFiber$"));
        return domElement[key];
    }

    function replacePlaceholders(string, placeholders) {
        if(!string) return "";
		return string.replace(/\{[^}]+\}/g, (placeholder) =>
			placeholders.hasOwnProperty(placeholder) ? placeholders[placeholder] : placeholder
		);
	}

    function getFinalPromptText() {
        // This function mimics the logic inside mikupad to construct the final prompt.
        // It accesses the React component's state via unsafeWindow.
        // NOTE: This is highly dependent on mikupad's internal structure and may break with updates.

        // 1. Get the main prompt text from the textarea
        const mainPrompt = document.getElementById('prompt-area').value;

        // 2. Access React component instance to get state
        let reactInstance = findReactInstance(document.getElementById('sidebar'));
        if (!reactInstance) {
            throw new Error("Could not find React instance for sidebar. The script might be outdated.");
        }

        // Traverse up to find the App component which has the storages in its props
        while (reactInstance && (!reactInstance.memoizedProps.sessionStorage || !reactInstance.memoizedProps.templateStorage)) {
            reactInstance = reactInstance.return;
        }

        if (!reactInstance) {
            throw new Error("Could not find the main App component. The script might be outdated.");
        }

        const props = reactInstance.memoizedProps;
        const { sessionStorage, templateStorage } = props;

        // 3. Get necessary data from storages
        const memoryTokens = sessionStorage.getProperty('memoryTokens');
        const authorNoteTokens = sessionStorage.getProperty('authorNoteTokens');
        const worldInfo = sessionStorage.getProperty('worldInfo');
        const authorNoteDepth = sessionStorage.getProperty('authorNoteDepth');
        const contextLength = sessionStorage.getProperty('contextLength');
        const selectedTemplate = sessionStorage.getProperty('template');
        const templates = templateStorage.getStorageData();

        // 4. Replicate the logic from mikupad to assemble the prompt
        // This is a simplified version of the logic in mikupad.html

        // 4a. Assemble World Info
        const assembledWorldInfo = (worldInfo.entries || [])
            .filter(entry =>
                entry.keys && entry.keys.length > 0 && entry.keys[0] !== "" && entry.text !== "" &&
                new RegExp(entry.keys.join('|'), "i").test(mainPrompt.slice(-(entry.search || 2048) * 3.3))
            )
            .map(entry => entry.text)
            .join("\n");

        // 4b. Assemble Author's Note
        const assembledAuthorNote = (authorNoteTokens.text && authorNoteTokens.text !== "")
            ? [authorNoteTokens.prefix, authorNoteTokens.text, authorNoteTokens.suffix].join("").replace(/\\n/g, '\n')
            : "";

        // 4c. Create context replacements
        const contextReplacements = {
            "{wiPrefix}": assembledWorldInfo ? (worldInfo.prefix || "") : "",
            "{wiText}": assembledWorldInfo,
            "{wiSuffix}": assembledWorldInfo ? (worldInfo.suffix || "") : "",
            "{memPrefix}": (memoryTokens.text || assembledWorldInfo) ? (memoryTokens.prefix || "") : "",
            "{memText}": memoryTokens.text || "",
            "{memSuffix}": (memoryTokens.text || assembledWorldInfo) ? (memoryTokens.suffix || "") : "",
        };

        // 4d. Truncate prompt and inject Author's Note
        const additionalContextLength = Object.values(contextReplacements).join('').length;
        const estimatedContextStart = Math.max(0, Math.round(mainPrompt.length - contextLength * 3.3 + additionalContextLength));
        let truncPrompt = mainPrompt.substring(estimatedContextStart);

        if (assembledAuthorNote) {
            const lines = truncPrompt.split('\n');
            const injDepth = Math.min(authorNoteDepth, lines.length);
            const injIndex = Math.max(0, lines.length - injDepth -1);
            lines.splice(injIndex, 0, assembledAuthorNote);
            truncPrompt = lines.join('\n');
        }
        contextReplacements["{prompt}"] = truncPrompt;

        // 4e. Apply context ordering
        const contextOrder = memoryTokens.contextOrder || "{memPrefix}{wiPrefix}{wiText}{wiSuffix}{memText}{memSuffix}{prompt}";
        return contextOrder.split("\n").map(line =>
            replacePlaceholders(line, contextReplacements)
        ).filter(line => line.trim() !== "").join("\n").replace(/\\n/g, '\n');
    }

    function buildPrompt() {
        const storyString = getFinalPromptText();
        const desiredLength = gmc.get('InputLength');
        return storyString.slice(-desiredLength);
    };

    function getRandomInterval() {
        const min = Math.ceil(gmc.get('MinCommentInterval'));
        const max = Math.floor(gmc.get('MaxCommentInterval'));
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function generateComment() {
        const url = gmc.get('ChatCompletionURL');
        const apiKey = gmc.get('ApiKey');
        const model = gmc.get('Model');
        const temperature = gmc.get('Temperature');
        const maxOutput = gmc.get('MaxOutput');
        const prompt = buildPrompt();
        const systemPrompt = gmc.get('SystemPrompt');
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        };
        const data = {
            'model': model,
            'messages': [
                {
                    'role': 'system',
                    'content': systemPrompt
                },
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            'temperature': temperature,
            'max_tokens': maxOutput,
            'stream': false,
            'structured_outputs': true,
            'response_format': {
                'type': 'json_schema',
                'json_schema': {
                    'name': 'comment',
                    'strict': true,
                    'schema': {
                        'type': 'object',
                        'properties': {
                            'tone': {
                                'type': 'string',
                                'description': 'The tone of the meta-commentary.'
                            },
                            'comment': {
                                'type': 'string',
                                'description': 'The meta-commentary. One single sentence.'
                            }
                        },
                        'required': ['tone', 'comment'],
                        'additionalProperties': false
                    }
                }
            }
        }
        const response = fetch(url, { // Note: fetch is already async and returns a promise
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });
        return response
    };

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function hypebotLoop() {
        const commentText = document.getElementById("comment");
        const promptOverlay = document.getElementById("prompt-overlay");
        let cachedText = promptOverlay.textContent;

        while (true) {
            const intervalSeconds = getRandomInterval();
            await sleep(intervalSeconds * 1000);

            const currentText = promptOverlay.textContent;

            if (currentText !== cachedText) {
                const url = gmc.get('ChatCompletionURL');
                const apiKey = gmc.get('ApiKey');
                const model = gmc.get('Model');
                if (!url || !apiKey || !model) {
                    commentText.textContent = "I'm not configured properly :( Please check my settings for the endpoint, API key, and model.";
                    console.error("Hypebot: Missing required configuration (ChatCompletionURL, ApiKey, or Model).");
                    continue;
                }
                try {
                    const response = await generateComment();
                    const data = await response.json();
                    const comment = JSON.parse(data.choices[0].message.content);
                    //debug
                    console.log(comment);
                    commentText.textContent = comment.comment;
                    cachedText = currentText;
                } catch (error) {
                    console.error("Hypebot: Error generating or displaying comment:", error);
                    commentText.textContent = "I hit my head on a \"" + error + "\" :(";
                }
            }
        }
    }

    //main loop
    // Wait for the target element to appear before initializing the UI
    const observer = new MutationObserver((mutations, obs) => {
        const promptArea = document.getElementById('prompt-area');
        if (promptArea) {
            initializeHypebotUI();
            obs.disconnect(); // Stop observing once the element is found
            // Start the main loop for the hypebot
            hypebotLoop();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})()