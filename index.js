const { createBot } = require('./src/core/bot');
const { createAIClient } = require('./src/core/aiClient');
const { executeTools } = require('./src/core/toolExecutor');
const { getRole } = require('./src/roles');
const config = require('./config');

const originalEmit = process.emit;
process.emit = function (name, data, ...args) {
    if (name === 'warning' && typeof data === 'object' && data.name === 'PartialReadError') return false;
    if (name === 'error' && data && (data.name === 'PartialReadError' || data.message?.includes('Unexpected buffer end'))) return false;
    return originalEmit.apply(process, [name, data, ...args]);
};

const client = createAIClient(config);
const conversationHistory = [];
const MAX_HISTORY = config.ai.max_history || 5;
let currentRole = getRole('architect');
const bot = createBot(config);

bot.loadPlugin(require('mineflayer-collectblock').plugin);

bot.on('spawn', () => {
    console.log(`[BOT] ${currentRole.config.name} online (${currentRole.config.description})`);
});

bot.on('chat', async (user, msg) => {
    if (user === bot.username) return;
    
    if (msg.startsWith('/')) {
        console.log(`[CHAT] Ignoring command: ${msg}`);
        return;
    }
    
    const systemPhrases = ['Set', 'game mode', 'Gave', 'Teleported', 'experience', 'Game mode'];
    if (systemPhrases.some(phrase => msg.includes(phrase))) {
        console.log(`[CHAT] Ignoring system message`);
        return;
    }
    
    console.log(`[CHAT] <${user}> ${msg}`);
    console.log('--- CHAIN START ---');

    if (msg.startsWith('!role ')) {
        try {
            currentRole = getRole(msg.split(' ')[1]);
            bot.chat(`Switched to ${currentRole.config.name}!`);
        } catch (e) {
            bot.chat(e.message);
        }
        console.log('--- CHAIN END ---');
        return;
    }

    bot.chat("Thinking...");
    conversationHistory.push({ role: "user", content: `Player ${user}: "${msg}"` });
    
    while (conversationHistory.length > MAX_HISTORY * 2) conversationHistory.shift();

    let shouldContinue = true;
    let iterations = 0;
    const MAX_ITERATIONS = 5;

    while (shouldContinue && iterations < MAX_ITERATIONS) {
        iterations++;
        shouldContinue = false;

        try {
            const response = await client.chat.completions.create({
                model: currentRole.config.model || config.ai.model,
                messages: [
                    { role: "system", content: currentRole.getSystemPrompt(bot) },
                    ...conversationHistory
                ],
                tools: currentRole.tools,
                tool_choice: "auto",
                temperature: currentRole.config.temperature || config.ai.temperature,
                max_tokens: currentRole.config.max_tokens || config.ai.max_tokens,
                top_p: currentRole.config.top_p || config.ai.top_p,
                frequency_penalty: currentRole.config.frequency_penalty ?? config.ai.frequency_penalty,
                presence_penalty: currentRole.config.presence_penalty ?? config.ai.presence_penalty,
                stop: currentRole.config.stop || config.ai.stop
            });

            const message = response.choices[0].message;

            if (message.content) {
                console.log(`[BOT] > ${message.content}`);
                conversationHistory.push({ role: "assistant", content: message.content });
                bot.chat(message.content);
            }

            if (message.tool_calls && message.tool_calls.length > 0) {
                console.log(`[AI] Tools: ${message.tool_calls.map(t => t.function.name).join(', ')}`);
                conversationHistory.push(message);

                await executeTools(bot, message.tool_calls, currentRole.actions, user);

                for (const toolCall of message.tool_calls) {
                    conversationHistory.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: "Action completed successfully."
                    });
                }
                
                shouldContinue = true;
            }

        } catch (e) {
            console.error("[AI] Error:", e);
            bot.chat("Error occurred.");
            shouldContinue = false;
        }
    }
    console.log('--- CHAIN END ---');
});

bot.on('kicked', (reason) => console.log('[BOT] Kicked:', reason));
bot.on('error', (err) => console.log('[BOT] Error:', err.message));
