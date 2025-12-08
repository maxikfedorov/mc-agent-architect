const { Vec3 } = require('vec3');

// Глобальная очередь для операций с инвентарем (Mutex)
let inventoryLock = Promise.resolve();

async function executeCode(bot, script) {
    console.log(`[ARCHITECT] Executing script (Length: ${script.length} chars)`);
    
    const origin = bot.entity.position.clone();
    const DELAY_MS = 100;

    const placeBlock = async (name, x, y, z) => {
        const targetX = Math.floor(origin.x + (x || 0));
        const targetY = Math.floor(origin.y + (y || 0));
        const targetZ = Math.floor(origin.z + (z || 0));
        bot.chat(`/setblock ${targetX} ${targetY} ${targetZ} ${name}`);
        await new Promise(r => setTimeout(r, DELAY_MS)); 
    };

    const placeBlockAbsolute = async (name, x, y, z) => {
        const targetX = Math.floor(x);
        const targetY = Math.floor(y);
        const targetZ = Math.floor(z);
        bot.chat(`/setblock ${targetX} ${targetY} ${targetZ} ${name}`);
        await new Promise(r => setTimeout(r, DELAY_MS));
    };

    const giveMe = async (name, count=64) => {
        const safeCount = Math.min(count, 64);
        const Item = require('prismarine-item')(bot.version);
        const id = bot.registry.itemsByName[name]?.id;
        
        if (id) {
            // Ставим запрос в очередь, чтобы не было конфликтов (Race Condition)
            await (inventoryLock = inventoryLock.then(async () => {
                try {
                    await bot.creative.setInventorySlot(36, new Item(id, safeCount));
                    // Задержка чуть больше, чтобы сервер успел подтвердить слот
                    await new Promise(r => setTimeout(r, 150)); 
                } catch (err) {
                    console.log(`[ARCHITECT] GiveMe Warning for ${name}:`, err.message);
                }
            }));
        } else {
            console.log(`[ARCHITECT] Unknown item: ${name}`);
        }
    };
    
    const functions = {
        get_creative_item: async ({item, count}) => giveMe(item, count),
        giveMe: async (name, count) => giveMe(name, count),
        placeBlock: async (name, x, y, z) => placeBlock(name, x, y, z),
        placeBlockAbsolute: async (name, x, y, z) => placeBlockAbsolute(name, x, y, z)
    };

    try {
        const asyncFunc = Object.getPrototypeOf(async function(){}).constructor;
        
        const executor = new asyncFunc(
            'Vec3', 
            'placeBlock', 
            'placeBlockAbsolute', 
            'giveMe', 
            'get_creative_item', 
            'functions', 
            'console', 
            script
        );
        
        await executor(
            Vec3, 
            placeBlock, 
            placeBlockAbsolute, 
            giveMe, 
            giveMe, 
            functions, 
            console
        );
        return "Script execution finished.";
    } catch (e) {
        console.error("[ARCHITECT] Runtime Error:", e);
        return `Runtime Error: ${e.message}`;
    }
}

module.exports = { executeCode };
