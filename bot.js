const mineflayer = require('mineflayer');
const { pathfinder, movements, goals } = require('mineflayer-pathfinder');
const http = require('http');

process.stdout.isTTY = true;

// Keep-alive server so Render does not freeze the bot's thread
http.createServer((req, res) => { 
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write("Bot is active 24/7!"); 
    res.end(); 
}).listen(process.env.PORT || 3000);

function createBot() {
    console.log('--- Connecting to play.divinitymc.fun ---');
    
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
        console.log('SUCCESS: hogglin1 connected to server. Waiting for map loading...');
        
        // Human-like registration delays
        setTimeout(() => { 
            bot.chat('/register Mnew1234 Mnew1234'); 
            console.log('--> Auto-sent register command');
        }, 5000);
        
        setTimeout(() => { 
            bot.chat('/login Mnew1234'); 
            console.log('--> Auto-sent login command');
        }, 9000);

        clearInterval(afkInterval); 
        afkInterval = setInterval(() => {
            if (!bot.entity) return;
            bot.swingHand('right');
            bot.look(bot.entity.yaw + 0.1, bot.entity.pitch, true);
        }, 40000); 
    });

    bot.on('message', (jsonMsg) => {
        const text = jsonMsg.toString();
        const cleanText = text.replace(/§[0-9a-fk-or]/g, '').toLowerCase().trim();
        console.log('[CHAT LOG]: ' + cleanText);
        
        if (cleanText.includes('/register') || cleanText.includes('register ')) {
            setTimeout(() => { bot.chat('/register Mnew1234 Mnew1234'); }, 1500);
            return;
        }
        if (cleanText.includes('/login') || cleanText.includes('login ')) {
            setTimeout(() => { bot.chat('/login Mnew1234'); }, 1500);
            return;
        }

        // TPA TRIGGER (Fixed to use standard bot.chat with an anti-kick buffer)
        if (cleanText.includes('tpa') || cleanText.includes('tpa to it')) {
            if (cleanText.includes('hogglin1')) return; 

            console.log('--> TPA request captured! Processing command delay...');
            setTimeout(() => {
                if (bot && bot.entity) {
                    bot.chat('/tpa hoglin');
                    console.log('--> TPA command successfully sent via standard chat input!');
                }
            }, 3500); // 3.5 seconds safety window
            return;
        }

        // SPAWN TRIGGER
        if (cleanText.includes('/spawn') || cleanText.includes('run /spawn')) {
            if (cleanText.includes('executing') || cleanText.includes('hogglin1')) return; 
            setTimeout(() => { bot.chat('/spawn'); }, 2000);
            return;
        }

        // COME TO ME TRIGGER
        if (cleanText.includes('/come') || cleanText.includes('come to me')) {
            if (cleanText.includes('hogglin1')) return;
            let targetEntity = null;
            for (const key in bot.entities) {
                const entity = bot.entities[key];
                if (entity.type === 'player' && entity.username && entity.username.toLowerCase() === 'hoglin') { 
                    targetEntity = entity; 
                    break; 
                }
            }
            if (!targetEntity) { 
                setTimeout(() => { bot.chat('/tpa hoglin'); }, 2000);
                return; 
            }
            
            const defaultMove = new movements(bot);
            defaultMove.canDig = false; 
            bot.pathfinder.setMovements(defaultMove);
            bot.pathfinder.setGoal(new goals.GoalFollow(targetEntity, 1));
            return;
        }

        // COORDINATE TRANSLATOR
        const coordMatches = cleanText.match(/(-?\d+(?:\.\d+)?)\s*[\/\s]\s*(-?\d+(?:\.\d+)?)\s*[\/\s]\s*(-?\d+(?:\.\d+)?)/);
        if (coordMatches) {
            if (cleanText.includes('moving to') || cleanText.includes('hogglin1')) return;
            const x = parseFloat(coordMatches); 
            const y = parseFloat(coordMatches); 
            const z = parseFloat(coordMatches);

            if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
                const defaultMove = new movements(bot);
                defaultMove.canDig = false;
                bot.pathfinder.setMovements(defaultMove);
                bot.pathfinder.setGoal(new goals.GoalBlock(Math.floor(x), Math.floor(y), Math.floor(z)));
            }
        }
    });

    bot.on('end', (reason) => {
        clearInterval(afkInterval);
        console.log(`RECONNECT LOOP: Kicked from server. Reason: ${reason}. Reconnecting in 15 seconds...`);
        setTimeout(() => { createBot(); }, 15000);
    });

    bot.on('error', (err) => { 
        console.log('SYSTEM ERROR CAUGHT: ', err.message); 
    });
}

createBot();
