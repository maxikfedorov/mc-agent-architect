const schema_getItem = {
    type: "function",
    function: {
        name: "get_creative_item",
        description: "Get items into your inventory. Works in both Creative and Survival (via commands).",
        parameters: {
            type: "object",
            properties: { 
                item: { type: "string", description: "Item name" }, 
                count: { type: "integer", minimum: 1, maximum: 64, default: 1 } 
            },
            required: ["item"]
        }
    }
};

const schema_dropAll = {
    type: "function",
    function: {
        name: "drop_inventory",
        description: "Drop all items from bot's inventory.",
        parameters: { type: "object", properties: {} }
    }
};

async function get_creative_item(bot, args, user) {
    const safeCount = Math.min(args.count || 1, 64);

    // Пробуем через Creative API
    if (bot.game.gameMode === 'creative') {
        const Item = require('prismarine-item')(bot.version);
        const id = bot.registry.itemsByName[args.item]?.id;

        if (id) {
            try {
                await bot.creative.setInventorySlot(36, new Item(id, safeCount));
                await new Promise(r => setTimeout(r, 100));
                console.log(`[INVENTORY] Gave ${safeCount}x ${args.item} (Creative)`);
                return;
            } catch(e) {
                console.log("[INVENTORY] Creative API failed:", e.message);
            }
        }
    }

    // Fallback: используем команду /give
    console.log(`[INVENTORY] Using /give command for ${args.item}`);
    bot.chat(`/give @s ${args.item} ${safeCount}`);
    await new Promise(r => setTimeout(r, 300));
    console.log(`[INVENTORY] Gave ${safeCount}x ${args.item} (Command)`);
}

async function drop_inventory(bot, args, user) {
    console.log("[INVENTORY] Dropping all items...");
    for (const item of bot.inventory.items()) {
        await bot.tossStack(item);
        await bot.waitForTicks(5);
    }
    bot.chat("Inventory cleared.");
}

module.exports = {
    get_creative_item: { schema: schema_getItem, execute: get_creative_item },
    drop_inventory: { schema: schema_dropAll, execute: drop_inventory }
};
