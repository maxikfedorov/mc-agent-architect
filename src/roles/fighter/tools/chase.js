const { goals } = require('mineflayer-pathfinder');

const schema = {
    type: "function",
    function: {
        name: "chase_player",
        description: "Pursue a player to get within attack range (3 blocks). Combines movement + attack.",
        parameters: {
            type: "object",
            properties: {
                target: { 
                    type: "string", 
                    description: "Username of player to chase and attack" 
                }
            },
            required: ["target"]
        }
    }
};

// Состояние преследования - ДОБАВИЛИ bot в состояние
let chaseState = {
    interval: null,
    target: null,
    bot: null  // ← ВАЖНО: сохраняем ссылку на бота
};

async function execute(bot, args, user) {
    const target = bot.players[args.target]?.entity;
    
    if (!target) {
        bot.chat(`Can't see ${args.target}!`);
        return;
    }

    // Останавливаем предыдущее преследование
    stopChase();

    console.log(`[FIGHTER] Chasing ${args.target}`);
    bot.chat(`Coming for you, ${args.target}!`);
    
    chaseState.target = args.target;
    chaseState.bot = bot;  // ← СОХРАНЯЕМ бота в состояние

    // Основной цикл преследования
    chaseState.interval = setInterval(() => {
        // Проверка здоровья
        if (bot.health <= 6) {
            console.log(`[FIGHTER] Low health during chase, retreating!`);
            bot.chat(`Retreating! (${bot.health} HP)`);
            stopChase();
            return;
        }

        const currentTarget = bot.players[chaseState.target]?.entity;
        
        if (!currentTarget) {
            console.log(`[FIGHTER] Lost sight of ${chaseState.target}`);
            bot.chat(`Where did you go?`);
            stopChase();
            return;
        }

        const distance = bot.entity.position.distanceTo(currentTarget.position);
        
        // Если в радиусе атаки - атакуем
        if (distance <= 3.5) {
            // Останавливаем движение
            bot.pathfinder.setGoal(null);
            
            // Атакуем
            bot.attack(currentTarget);
            bot.lookAt(currentTarget.position.offset(0, currentTarget.height, 0));
            
        } else if (distance > 20) {
            // Слишком далеко - прекращаем погоню
            console.log(`[FIGHTER] Target too far (${distance.toFixed(1)}m), giving up`);
            bot.chat(`You're running away? Coward!`);
            stopChase();
            
        } else {
            // Преследуем
            const goal = new goals.GoalNear(
                currentTarget.position.x,
                currentTarget.position.y,
                currentTarget.position.z,
                2 // Подходим на 2 блока
            );
            bot.pathfinder.setGoal(goal, true);
        }
        
    }, 300); // Обновление каждые 300ms для плавности
}

function stopChase() {
    if (chaseState.interval) {
        clearInterval(chaseState.interval);
        chaseState.interval = null;
        
        // ИСПОЛЬЗУЕМ СОХРАНЁННОГО бота
        if (chaseState.bot) {
            chaseState.bot.pathfinder.setGoal(null);
        }
        
        chaseState.target = null;
        chaseState.bot = null;  // Очищаем ссылку
        
        console.log(`[FIGHTER] Chase stopped`);
    }
}

module.exports = { schema, execute, stopChase };
