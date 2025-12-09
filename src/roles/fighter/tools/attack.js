const schema = {
    type: "function",
    function: {
        name: "attack_player",
        description: "Attack a nearby player with your current weapon. Use when enemy is within 4 blocks.",
        parameters: {
            type: "object",
            properties: {
                target: { 
                    type: "string", 
                    description: "Username of player to attack" 
                },
                aggressive: {
                    type: "boolean",
                    description: "If true, continuously attack until stopped. If false, single strike.",
                    default: false
                }
            },
            required: ["target"]
        }
    }
};

// Глобальное состояние атаки
let attackState = {
    interval: null,
    target: null,
    lastWarning: 0
};

async function execute(bot, args, user) {
    const target = bot.players[args.target]?.entity;
    
    if (!target) {
        bot.chat(`Can't see ${args.target}!`);
        return;
    }

    const distance = bot.entity.position.distanceTo(target.position);
    
    // Проверка дистанции с защитой от спама
    if (distance > 4.5) {
        const now = Date.now();
        if (now - attackState.lastWarning > 3000) { // Сообщение раз в 3 секунды
            bot.chat(`${args.target} is too far (${distance.toFixed(1)}m)!`);
            attackState.lastWarning = now;
        }
        return;
    }

    // КРИТИЧНО: Останавливаем предыдущую атаку перед новой
    stopAttack();

    if (args.aggressive) {
        console.log(`[FIGHTER] Starting aggressive attack on ${args.target}`);
        bot.chat(`Engaging ${args.target}!`);
        
        attackState.target = args.target;
        attackState.interval = setInterval(() => {
            // Проверка здоровья
            if (bot.health <= 6) {
                console.log(`[FIGHTER] Low health (${bot.health}), retreating!`);
                bot.chat(`Retreating! (${bot.health} HP left)`);
                stopAttack();
                return;
            }

            const currentTarget = bot.players[attackState.target]?.entity;
            if (currentTarget) {
                const dist = bot.entity.position.distanceTo(currentTarget.position);
                if (dist <= 4.5) {
                    bot.attack(currentTarget);
                } else {
                    // Цель далеко - останавливаем атаку
                    console.log(`[FIGHTER] Target out of range (${dist.toFixed(1)}m)`);
                    stopAttack();
                }
            } else {
                // Цель пропала
                console.log(`[FIGHTER] Lost sight of target`);
                bot.chat(`Lost sight of ${attackState.target}.`);
                stopAttack();
            }
        }, 500); // Атака каждые 500ms
        
    } else {
        // Одиночный удар
        console.log(`[FIGHTER] Single strike on ${args.target}`);
        bot.attack(target);
        bot.chat(`Strike!`);
    }
}

// Функция остановки атаки
function stopAttack() {
    if (attackState.interval) {
        clearInterval(attackState.interval);
        attackState.interval = null;
        attackState.target = null;
        console.log(`[FIGHTER] Attack stopped`);
    }
}

// Экспортируем функцию остановки для использования в других инструментах
module.exports = { schema, execute, stopAttack };
