const mineflayer = require('mineflayer');
const { pathfinder, Movements } = require('mineflayer-pathfinder');

function createBot(config) {
    const bot = mineflayer.createBot(config.minecraft);
    bot.loadPlugin(pathfinder);
    
    bot.on('spawn', () => {
        const mcData = require('minecraft-data')(bot.version);
        bot.pathfinder.setMovements(new Movements(bot, mcData));
        console.log(`[BOT] ${config.minecraft.username} spawned.`);
    });
    
    return bot;
}

module.exports = { createBot };
