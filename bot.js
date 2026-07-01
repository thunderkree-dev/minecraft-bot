const mineflayer = require('mineflayer');
const { pathfinder, movements, goals } = require('mineflayer-pathfinder');
const http = require('http');

process.stdout.isTTY = true;

http.createServer((req, res) => { 
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write("Bot is active 24/7!"); 
    res.end(); 
}).listen(process.env.PORT || 3000);

function createBot() {
    console.log('--- Attempting connection to play.divinitymc.fun ---');
    
    const bot = mineflayer.createBot({
        host: 'play.divinitymc.fun', 
        port: 25565,
        username: 'hogglin1',   
        version: '1.21.1',
        checkTimeoutInterval: 120000 
    });

    bot.loadPlugin(pathfinder);
    let afkInterval;

    bot.on('login', () => {
        console.log('SUCCESS: hogglin1 fully logged into the server core!');
        
        // FIXED: Added missing forward slashes (/) to registration commands
        setTimeout(() => { 
            bot.chat('/register Mnew1234 Mnew1234'); 
            console.log('--> Auto-sent register string');
        }, 4000);
        
        setTimeout(() => { 
            bot.chat('/login Mnew1234'); 
            console.log('--> Auto-sent login string');
        }, 7000);

        clearInterval(afkInterval); 
        afkInterval = setInterval(() => {
            if (!bot.entity) return;
            
            // FIXED: Changed swingHand to use the correct arm property format
            bot.swingHand('right');
            
            bot.look(bot.entity.yaw + 0.1, bot.entity.pitch, true);
            setTimeout(() => { if (bot.entity) bot.look(bot.entity.yaw - 0.1, bot.entity.pitch, true); }, 300);
        }, 35000); 
    });

    bot.on('message', (jsonMsg) => {
        const text = jsonMsg.toString();
        const cleanText = text.replace(/§[0-9a-fk-or]/g, '').toLowerCase().trim();
        console.log('[CHAT LOG]: ' + cleanText);
        
        if (cleanText.includes('/register') || cleanText.includes('register ')) {
            bot.chat('/register Mnew1234 Mnew1234');
        }
        if (cleanText.includes('/login') || cleanText.includes('login ')) {
            bot.chat('/login Mnew1234');
        }

        if (cleanText.includes('tpa to it') || cleanText.includes('/tpa')) {
            console.log('--> TPA Request triggered! Waiting for human-like delay...');
            setTimeout(() => {
                if (bot && bot.entity) {
                    bot.chat('/tpa hoglin');
                    console.log('--> Sent safe command: /tpa hoglin');
                }
            }, 2500);
            return;
        }

        if (cleanText.includes('/spawn') || cleanText.includes('run /spawn')) {
            if (cleanText.includes('executing')) return; 
            setTimeout(() => { bot.chat('/spawn'); }, 2500);
            return;
        }

        if (cleanText.includes('/come') || cleanText.includes('come to me')) {
            let targetEntity = null;
            for (const key in bot.entities) {
                const entity = bot.entities[key];
                if (entity.type === 'player' && entity.username && entity.username.toLowerCase() === 'hoglin') { 
                    targetEntity = entity; 
                    break; 
                }
            }
            if (!targetEntity) { 
                console.log('--> Pathfinder target missing. Reverting to safe /tpa.');
                setTimeout(() => { bot.chat('/tpa hoglin'); }, 2500);
                return; 
            }
            
            const defaultMove = new movements(bot);
            defaultMove.canDig = false; 
            bot.pathfinder.setMovements(defaultMove);
            bot.pathfinder.setGoal(new goals.GoalFollow(targetEntity, 1));
            return;
        }

        const coordMatches = cleanText.match(/(-?\d+(?:\.\d+)?)\s*[\/\s]\s*(-?\d+(?:\.\d+)?)\s*[\/\s]\s*(-?\d+(?:\.\d+)?)/);
        if (coordMatches) {
            const x = parseFloat(coordMatches); 
            const y = parseFloat(coordMatches); 
            const z = parseFloat(coordMatches);

            if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
                console.log(`--> Pathing via Cloud toward X:${x} Y:${y} Z:${z}`);
                const defaultMove = new movements(bot);
                defaultMove.canDig = false;
                bot.pathfinder.setMovements(defaultMove);
                bot.pathfinder.setGoal(new goals.GoalBlock(Math.floor(x), Math.floor(y), Math.floor(z)));
            }
        }
    });

    bot.on('end', (reason) => {
        clearInterval(afkInterval);
        console.log(`CRITICAL: Bot disconnected from server network. Reason: ${reason}. Reboots in 12s...`);
        setTimeout(() => { createBot(); }, 12000);
    });

    bot.on('error', (err) => { 
        console.log('HANDLED ERROR: ', err.message); 
    });
}

createBot();
