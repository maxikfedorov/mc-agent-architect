const schema = {
    type: "function",
    function: {
        name: "execute_command",
        description: "Execute a Minecraft server command (requires OP permissions). Use for complex items (enchantments), time, weather, or gamerules. IMPORTANT TARGETING RULES: 1. To target the USER, use their username explicitly (e.g. 'give PlayerName ...'). 2. To target YOURSELF (the bot), use '@s'. 3. Avoid '@p' unless you specifically mean 'nearest entity to the bot'.",
        parameters: {
            type: "object",
            properties: { 
                command: { 
                    type: "string", 
                    description: "Command string without leading slash. Examples: 'give Steve diamond_sword{...}', 'effect give @s speed', 'time set day'." 
                } 
            },
            required: ["command"]
        }
    }
};

async function execute(bot, args, user) {
    // Добавляем слеш, если его нет, чтобы Mineflayer точно понял, что это команда
    const cmd = args.command.startsWith('/') ? args.command : `/${args.command}`;
    console.log(`[COMMAND] Executing: ${cmd}`);
    bot.chat(cmd);
}

module.exports = { schema, execute };
