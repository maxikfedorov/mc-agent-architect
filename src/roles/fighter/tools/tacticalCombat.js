const { goals } = require('mineflayer-pathfinder');
const { Vec3 } = require('vec3');

const schema = {
    type: "function",
    function: {
        name: "tactical_combat",
        description: "Advanced PVP combat with crit jumps, strafing, and shield blocking. Use for serious fights.",
        parameters: {
            type: "object",
            properties: {
                target: { 
                    type: "string", 
                    description: "Username of player to fight" 
                },
                style: {
                    type: "string",
                    enum: ["aggressive", "defensive", "balanced"],
                    description: "Combat style: aggressive (chase+crit), defensive (shield+retreat), balanced (mix)",
                    default: "balanced"
                }
            },
            required: ["target"]
        }
    }
};

let combatState = {
    interval: null,
    target: null,
    bot: null,
    style: "balanced",
    lastCrit: 0,
    strafeDirection: 1,
    shieldEquipped: false
};

async function execute(bot, args, user) {
    const target = bot.players[args.target]?.entity;
    
    if (!target) {
        bot.chat(`Can't see ${args.target}!`);
        return;
    }

    stopTacticalCombat();

    const sword = bot.inventory.items().find(i => 
        i.name.includes('sword') || i.name.includes('axe')
    );
    
    if (sword) {
        try {
            await bot.equip(sword, 'hand');
            console.log(`[TACTICAL] Equipped weapon: ${sword.name}`);
        } catch (e) {
            console.log(`[TACTICAL] Weapon equip failed: ${e.message}`);
        }
    }

    combatState.bot = bot;
    combatState.target = args.target;
    combatState.style = args.style || "balanced";
    combatState.shieldEquipped = false;

    console.log(`[TACTICAL] Starting ${combatState.style} combat with ${args.target}`);
    bot.chat(`Engaging ${args.target} (${combatState.style} mode)!`);

    if (combatState.style === "defensive") {
        await equipShield(bot);
        combatState.shieldEquipped = true;
    }

    combatState.interval = setInterval(async () => {
        const currentTarget = bot.players[combatState.target]?.entity;
        
        if (!currentTarget) {
            console.log(`[TACTICAL] Lost target`);
            bot.chat(`Where did you go?`);
            stopTacticalCombat();
            return;
        }

        const distance = bot.entity.position.distanceTo(currentTarget.position);
        const health = bot.health;

        if (health <= 6) {
            console.log(`[TACTICAL] Critical health, retreating!`);
            bot.chat(`Retreating! (${Math.floor(health)} HP)`);
            
            if (!combatState.shieldEquipped) {
                await equipShield(bot);
                combatState.shieldEquipped = true;
            }
            
            bot.activateItem();
            stopTacticalCombat();
            return;
        }

        if (distance > 20) {
            console.log(`[TACTICAL] Target too far`);
            bot.chat(`Running away, ${combatState.target}?`);
            stopTacticalCombat();
            return;
        }

        if (distance <= 4) {
            await handleMeleeCombat(bot, currentTarget, distance, health);
        } else {
            await handleChase(bot, currentTarget);
        }

    }, 250);
}

async function handleMeleeCombat(bot, target, distance, health) {
    const now = Date.now();

    if (combatState.style === "defensive" && health <= 12) {
        if (!combatState.shieldEquipped) {
            await equipShield(bot);
            combatState.shieldEquipped = true;
        }
        
        if (!bot.usingHeldItem) {
            bot.activateItem();
        }
        
        const retreatDir = bot.entity.position.minus(target.position).normalize();
        const retreatGoal = new goals.GoalBlock(
            bot.entity.position.x + retreatDir.x * 3,
            bot.entity.position.y,
            bot.entity.position.z + retreatDir.z * 3
        );
        bot.pathfinder.setGoal(retreatGoal, true);
        return;
    }

    bot.lookAt(target.position.offset(0, target.height * 0.8, 0));

    if (distance < 3) {
        strafeAround(bot, target);
    }

    const canCrit = now - combatState.lastCrit > 1000;
    
    if (canCrit && !bot.entity.onGround) {
        bot.attack(target);
        combatState.lastCrit = now;
    } else if (canCrit && bot.entity.onGround) {
        bot.setControlState('jump', true);
        setTimeout(() => {
            bot.setControlState('jump', false);
            bot.attack(target);
        }, 50);
        combatState.lastCrit = now;
    } else {
        bot.attack(target);
    }
}

async function handleChase(bot, target) {
    bot.pathfinder.setGoal(new goals.GoalNear(
        target.position.x,
        target.position.y,
        target.position.z,
        2
    ), true);
}

function strafeAround(bot, target) {
    if (Math.random() < 0.1) {
        combatState.strafeDirection *= -1;
    }

    const directionToTarget = target.position.minus(bot.entity.position).normalize();
    const strafeVector = new Vec3(-directionToTarget.z, 0, directionToTarget.x).scaled(combatState.strafeDirection);
    
    const strafeGoal = new goals.GoalBlock(
        bot.entity.position.x + strafeVector.x * 2,
        bot.entity.position.y,
        bot.entity.position.z + strafeVector.z * 2
    );
    
    bot.pathfinder.setGoal(strafeGoal, true);
}

async function equipShield(bot) {
    const currentOffhand = bot.inventory.slots[45];
    if (currentOffhand && currentOffhand.name === 'shield') {
        console.log(`[TACTICAL] Shield already in off-hand`);
        return;
    }

    const shield = bot.inventory.items().find(i => i.name === 'shield');
    if (shield) {
        try {
            await bot.equip(shield, 'off-hand');
            console.log(`[TACTICAL] Shield equipped to off-hand`);
        } catch (e) {
            console.log(`[TACTICAL] Shield equip failed: ${e.message}`);
        }
    } else {
        console.log(`[TACTICAL] Getting shield via command`);
        bot.chat(`/give @s shield 1`);
        await new Promise(r => setTimeout(r, 500));
        
        const newShield = bot.inventory.items().find(i => i.name === 'shield');
        if (newShield) {
            try {
                await bot.equip(newShield, 'off-hand');
                console.log(`[TACTICAL] Shield equipped after /give`);
            } catch (e) {
                console.log(`[TACTICAL] Shield equip still failed`);
            }
        }
    }
}

function stopTacticalCombat() {
    if (combatState.interval) {
        clearInterval(combatState.interval);
        combatState.interval = null;
        
        if (combatState.bot) {
            combatState.bot.pathfinder.setGoal(null);
            combatState.bot.clearControlStates();
            combatState.bot.deactivateItem();
        }
        
        combatState.target = null;
        combatState.bot = null;
        combatState.shieldEquipped = false;
        
        console.log(`[TACTICAL] Combat stopped`);
    }
}

module.exports = { schema, execute, stopTacticalCombat };
