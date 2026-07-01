const mineflayer = require('mineflayer');
const { pathfinder, movements, goals } = require('mineflayer-pathfinder');
const http = require('http');

// Keep-alive server so Render does not put the bot to sleep
http.createServer((req, res) => { res.write("Bot is online 24/7!"); res.end(); }).listen(process.env.PORT || 3000);

function createBot() {
    const bot = mineflayer.createBot({
        host: 'play.divinitymc.fun', 
        port: 25565,
        username: 'dinglebbb',   
        version: '1.21.1'        
    });

    bot.loadPlugin(pathfinder);
    let afkInterval;

    bot.on('login', () => {
        console.log('dinglebbb connected! 24/7 Cloud mode activated.');
        setTimeout(() => {
            bot.chat('/register Mnew1234 Mnew1234');
            bot.chat('/login Mnew1234');
        }, 2000);

        clearInterval(afkInterval); 
        afkInterval = setInterval(() => {
            if (!bot.entity) return;
            bot.swingHand('javascript');
            bot.look(bot.entity.yaw + 0.2, bot.entity.pitch, true);
            setTimeout(() => { if (bot.entity) bot.look(bot.entity.yaw - 0.2, bot.entity.pitch, true); }, 500);
        }, 20000);
    });

    bot.on('message', (jsonMsg) => {
        const text = jsonMsg.toString();
        console.log('[CHAT]: ' + text);
        const clean = text.toLowerCase();
        
        if (clean.includes('/register') || clean.includes('register ')) bot.chat('/register Mnew1234 Mnew1234');
        if (clean.includes('/login') || clean.includes('login ')) bot.chat('/login Mnew1234');
        if (clean.includes('/spawn') || clean.includes('run /spawn')) { bot.chat('/spawn'); return; }
        if (clean.includes('tpa to it') || clean.includes('/tpa')) { bot.chat('/tpa hoglin'); return; }

        if (clean.includes('/come') || clean.includes('come to me')) {
            let targetEntity = null;
            for (const key in bot.entities) {
                const entity = bot.entities[key];
                if (entity.type === 'player' && entity.username && entity.username.toLowerCase() === 'hoglin') { targetEntity = entity; break; }
            }
            if (!targetEntity) { bot.chat('/tpa hoglin'); return; }
            const defaultMove = new movements(bot);
            bot.pathfinder.setMovements(defaultMove);
            bot.pathfinder.setGoal(new goals.GoalFollow(targetEntity, 1));
            return;
        }

        const coordMatches = text.match(/(-?\d+(?:\.\d+)?)\s*[\/\s]\s*(-?\d+(?:\.\d+)?)\s*[\/\s]\s*(-?\d+(?:\.\d+)?)/);
        if (coordMatches) {
            const x = parseFloat(coordMatches); const y = parseFloat(coordMatches); const z = parseFloat(coordMatches);
            if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
                const defaultMove = new movements(bot);
                bot.pathfinder.setMovements(defaultMove);
                bot.pathfinder.setGoal(new goals.GoalBlock(Math.floor(x), Math.floor(y), Math.floor(z)));
            }
        }
    });

    bot.on('end', (reason) => {
        clearInterval(afkInterval);
        console.log(`Bot disconnected: ${reason}. Reconnecting...`);
        setTimeout(() => { createBot(); }, 10000);
    });
    bot.on('error', (err) => { console.log('Error: ', err.message); });
}
createBot();
