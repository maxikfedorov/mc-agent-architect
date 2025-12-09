const schema = {
    type: "function",
    function: {
        name: "eat_food",
        description: "Consume food to restore health and hunger. Use when health is low but not critical.",
        parameters: {
            type: "object",
            properties: {
                food: {
                    type: "string",
                    description: "Food item name (e.g. 'golden_apple', 'cooked_beef', 'bread')",
                    default: "golden_apple"
                }
            }
        }
    }
};

async function execute(bot, args, user) {
    const foodName = args.food || 'golden_apple';
    
    console.log(`[FIGHTER] Attempting to eat ${foodName}... (Current HP: ${bot.health})`);
    
    let food = bot.inventory.items().find(i => i.name === foodName);

    if (!food) {
        console.log(`[FIGHTER] Getting ${foodName} via command`);
        bot.chat(`/give @s ${foodName} 64`);
        await new Promise(r => setTimeout(r, 600));
        food = bot.inventory.items().find(i => i.name === foodName);
    }

    if (food) {
        bot.chat(`Eating ${foodName}!`);
        
        try {
            await bot.equip(food, 'hand');
            bot.consume();
            
            console.log(`[FIGHTER] Started eating ${foodName}`);
            
            await bot.waitForTicks(35);
            
            console.log(`[FIGHTER] Finished eating (New HP: ${bot.health})`);
            
            await new Promise(r => setTimeout(r, 200));
            
            const sword = bot.inventory.items().find(i => 
                i.name.includes('sword') || i.name.includes('axe')
            );
            
            if (sword) {
                try {
                    await bot.equip(sword, 'hand');
                    console.log(`[FIGHTER] Re-equipped weapon: ${sword.name}`);
                } catch (e) {
                    console.log(`[FIGHTER] Re-equip failed: ${e.message}`);
                }
            } else {
                console.log(`[FIGHTER] No weapon found in inventory`);
                bot.chat(`/give @s diamond_sword 1`);
                await new Promise(r => setTimeout(r, 300));
                const newSword = bot.inventory.items().find(i => i.name.includes('sword'));
                if (newSword) {
                    await bot.equip(newSword, 'hand');
                    console.log(`[FIGHTER] Equipped new weapon: ${newSword.name}`);
                }
            }
            
            bot.chat(`Healed to ${Math.floor(bot.health)} HP!`);
            
        } catch (e) {
            console.log(`[FIGHTER] Eat failed: ${e.message}`);
            bot.chat(`Can't eat right now!`);
        }
    } else {
        bot.chat(`Can't get ${foodName}!`);
    }
}

module.exports = { schema, execute };
