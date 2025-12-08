const { goals } = require('mineflayer-pathfinder');

async function comeToPlayer(bot, username) {
    const target = bot.players[username]?.entity;
    if (!target) { 
        bot.chat("Can't see you."); 
        return; 
    }
    bot.pathfinder.setGoal(new goals.GoalNear(target.position.x, target.position.y, target.position.z, 2));
}

async function dropAll(bot) {
    for (const item of bot.inventory.items()) {
        await bot.tossStack(item);
        await bot.waitForTicks(5);
    }
}

// Теперь безопасно (с проверкой количества и try-catch)
async function getCreativeItem(bot, name, count = 1) {
    const Item = require('prismarine-item')(bot.version);
    const id = bot.registry.itemsByName[name]?.id;
    const safeCount = Math.min(count, 64);

    if (id) {
        try {
            await bot.creative.setInventorySlot(36, new Item(id, safeCount));
            await new Promise(r => setTimeout(r, 100));
        } catch(e) {
            console.log("[BASIC] Creative give error:", e.message);
        }
    }
}

module.exports = { comeToPlayer, dropAll, getCreativeItem };
