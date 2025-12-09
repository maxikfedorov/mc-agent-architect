const schema = {
    type: "function",
    function: {
        name: "chat",
        description: "Send a message to Minecraft chat.",
        parameters: {
            type: "object",
            properties: { 
                message: { type: "string", description: "Text to send" } 
            },
            required: ["message"]
        }
    }
};

async function execute(bot, args, user) {
    bot.chat(args.message);
}

module.exports = { schema, execute };
