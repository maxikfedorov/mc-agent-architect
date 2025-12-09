const { goals } = require('mineflayer-pathfinder');

const schema = {
    type: "function",
    function: {
        name: "come_to_player",
        description: "Navigate to a player's position using pathfinding.",
        parameters: {
            type: "object",
            properties: { 
                target: { 
                    type: "string",
                    description: "Player username to approach."
                } 
            },
            required: ["target"]
        }
    }
};

async function execute(bot, args, user) {
    const target = bot.players[args.target]?.entity;
    if (!target) { 
        bot.chat(`Can't see ${args.target}.`); 
        return; 
    }
    console.log(`[MOVEMENT] Pathfinding to ${args.target}...`);
    bot.pathfinder.setGoal(new goals.GoalNear(target.position.x, target.position.y, target.position.z, 2));
}

module.exports = { schema, execute };
