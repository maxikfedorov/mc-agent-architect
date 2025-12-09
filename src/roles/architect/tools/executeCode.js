const { Vec3 } = require('vec3');
const { getInventoryLock, setInventoryLock } = require('../../../core/utils/inventoryLock');

const schema = {
    type: "function",
    function: {
        name: "execute_code",
        description: "Execute async JavaScript for building. Available: placeBlock, placeBlockAbsolute, giveMe.",
        parameters: {
            type: "object",
            properties: {
                reasoning: { type: "string", description: "Architectural logic and calculations." },
                script: { type: "string", description: "Async JS code with loops." }
            },
            required: ["reasoning", "script"]
        }
    }
};

async function execute(bot, args, user) {
    console.log(`[EXECUTE_CODE] Reasoning: ${args.reasoning}`);
    
    const origin = bot.entity.position.clone();
    const DELAY_MS = 100;

    const placeBlock = async (name, x, y, z) => {
        bot.chat(`/setblock ${Math.floor(origin.x + x)} ${Math.floor(origin.y + y)} ${Math.floor(origin.z + z)} ${name}`);
        await new Promise(r => setTimeout(r, DELAY_MS)); 
    };

    const placeBlockAbsolute = async (name, x, y, z) => {
        bot.chat(`/setblock ${Math.floor(x)} ${Math.floor(y)} ${Math.floor(z)} ${name}`);
        await new Promise(r => setTimeout(r, DELAY_MS));
    };

    const giveMe = async (name, count=64) => {
        const Item = require('prismarine-item')(bot.version);
        const id = bot.registry.itemsByName[name]?.id;
        
        if (id) {
            const currentLock = getInventoryLock();
            const newLock = currentLock.then(async () => {
                try {
                    await bot.creative.setInventorySlot(36, new Item(id, Math.min(count, 64)));
                    await new Promise(r => setTimeout(r, 150)); 
                } catch (err) {
                    console.log(`[EXECUTE_CODE] GiveMe error: ${err.message}`);
                }
            });
            setInventoryLock(newLock);
            await newLock;
        }
    };
    
    try {
        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
        const executor = new AsyncFunction('Vec3', 'placeBlock', 'placeBlockAbsolute', 'giveMe', 'console', args.script);
        await executor(Vec3, placeBlock, placeBlockAbsolute, giveMe, console);
        bot.chat("✅ Done!");
    } catch (e) {
        console.error("[EXECUTE_CODE] Error:", e);
        bot.chat(`Error: ${e.message}`);
    }
}

module.exports = { schema, execute };
