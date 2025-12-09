const { stopAttack } = require('./attack');
const { stopChase } = require('./chase');
const { stopTacticalCombat } = require('./tacticalCombat');

const schema = {
    type: "function",
    function: {
        name: "disengage",
        description: "Stop all combat actions immediately. Use when retreating or health is low.",
        parameters: {
            type: "object",
            properties: {}
        }
    }
};

async function execute(bot, args, user) {
    console.log(`[FIGHTER] Disengaging from combat`);
    stopAttack();
    stopChase();
    stopTacticalCombat();
    bot.pathfinder.setGoal(null);
    bot.clearControlStates();
    bot.chat("Disengaged!");
}

module.exports = { schema, execute };
