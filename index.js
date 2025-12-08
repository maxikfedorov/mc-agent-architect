const mineflayer = require('mineflayer');
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const collectBlock = require('mineflayer-collectblock').plugin;
const OpenAI = require('openai');

const config = require('./config');
const tools = require('./src/ai/tools');
const getSystemPrompt = require('./src/ai/systemPrompt');
const { handleToolCall } = require('./src/actions/index');

const originalEmit = process.emit;
process.emit = function (name, data, ...args) {
    if (name === 'warning' && typeof data === 'object' && data.name === 'PartialReadError') return false;
    if (name === 'error' && data && (data.name === 'PartialReadError' || data.message?.includes('Unexpected buffer end'))) return false;
    return originalEmit.apply(process, [name, data, ...args]);
};

const client = new OpenAI(config.ai);
const bot = mineflayer.createBot(config.minecraft);
const conversationHistory = [];
const MAX_HISTORY = 6; 

bot.loadPlugin(pathfinder);
bot.loadPlugin(collectBlock);

bot.on('spawn', () => {
    const mcData = require('minecraft-data')(bot.version);
    bot.pathfinder.setMovements(new Movements(bot, mcData));
    console.log(`[BOT] ${config.minecraft.username} is online.`);
});

bot.on('chat', async (user, msg) => {
    if (user === bot.username) return;
    console.log(`[CHAT] ${user}: ${msg}`);

    bot.chat("Thinking...");
    console.log(`[AI] Processing request from ${user}...`);

    conversationHistory.push({ role: "user", content: `Player ${user}: "${msg}"` });
    while (conversationHistory.length > MAX_HISTORY) conversationHistory.shift();

    try {
        const response = await client.chat.completions.create({
            model: config.ai.model,
            messages: [
                { role: "system", content: getSystemPrompt(bot) },
                ...conversationHistory
            ],
            tools: tools,
            tool_choice: "auto",
            temperature: config.ai.temperature
        });

        console.log(`[AI] Generation complete. Tokens: ${response.usage?.total_tokens}`);

        const message = response.choices[0].message;
        
        if (message.content) {
            conversationHistory.push({ role: "assistant", content: message.content });
        } else if (message.tool_calls) {
            const toolNames = message.tool_calls.map(t => t.function.name).join(', ');
            conversationHistory.push({ role: "assistant", content: `[Executed Tools: ${toolNames}]` });
        }
        while (conversationHistory.length > MAX_HISTORY) conversationHistory.shift();

        if (message.tool_calls) {
            console.log(`[AI] Tool Calls: ${message.tool_calls.length}`);
            for (const call of message.tool_calls) {
                try {
                    const args = JSON.parse(call.function.arguments);
                    console.log(`[AI] Calling tool: ${call.function.name}`);
                    await handleToolCall(bot, call.function.name, args, user);
                } catch (parseError) {
                    console.error(`[AI] Failed to parse arguments for ${call.function.name}:`, parseError);
                }
            }
        } else {
            console.log(`[AI] Response: ${message.content}`);
            bot.chat(message.content);
        }

    } catch (e) {
        console.error("[AI] Critical Error:", e);
        bot.chat("My brain hurts.");
    }
});

bot.on('kicked', (reason) => console.log('Kicked:', reason));
bot.on('error', (err) => console.log('Bot Error:', err.message));
