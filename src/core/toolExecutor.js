async function executeTools(bot, toolCalls, toolExecutors, user) {
    for (const call of toolCalls) {
        try {
            const args = JSON.parse(call.function.arguments);
            const fnName = call.function.name;
            
            console.log(`[EXECUTOR] Tool: ${fnName}`, args);
            
            const executor = toolExecutors[fnName];
            if (executor) {
                await executor(bot, args, user);
            } else {
                console.log(`[EXECUTOR] Unknown tool: ${fnName}`);
                bot.chat(`I don't know '${fnName}'.`);
            }
        } catch (e) {
            console.error(`[EXECUTOR] Error:`, e.message);
        }
    }
}

module.exports = { executeTools };
