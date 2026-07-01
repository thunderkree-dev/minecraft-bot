const mineflayer = require('mineflayer');
const { pathfinder, movements, goals } = require('mineflayer-pathfinder');
const http = require('http');

// Force Render logs to print instantly instead of buffering/freezing
process.stdout.isTTY = true;

// Keep-alive server so Render does not freeze the bot's thread
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
        username: 'hogglin1',   // <-- CHANGED to your new requested name
        version: '1.21.1',
        checkTimeoutInterval: 90000 // Prevent proxy firewalls from auto-kicking
    });

    bot.loadPlugin(pathfinder);
    let afkInterval;

    bot.on('login', () => {
        console.log('SUCCESS: hogglin1 fully logged into the server core!');
        
        // Anti-spam delayed login triggers
        setTimeout(() => { bot.chat('/register Mnew1234 Mnew1234'); }, 3000);
        setTimeout(() => { bot.chat('/login Mnew1234'); }, 500);

        // Safe 24/7 anti-kick movements
        clearInterval(afkInterval); 
        afkInterval = setInterval(() => {
            if (!bot.entity) return;
            bot.swingHand('javascript');
            bot.look(bot.entity.yaw + 0.1, bot.entity.pitch, true);
            setTimeout(() => { if (bot.entity) bot.look(bot.entity.yaw - 0.1, bot.entity.pitch, true); }, 300);
        }, 30000); 
    });

    bot.on('message', (jsonMsg) => {
        const text = jsonMsg.toString();
        // Clear out special colored text formatting characters so the cloud logs don't crash
        const cleanText = text.replace(/§[0-9a-fk-or]/g, '').toLowerCase().trim();
        console.log('[CHAT LOG]: ' + cleanText);
        
        if (cleanText.includes('/register') || cleanText.includes('register ')) {
            bot.chat('/register Mnew1234 Mnew1234');
        }
        if (cleanText.includes('/login') || cleanText.includes('login ')) {
            bot.chat('/login Mnew1234');
        }

        // TELEPORT TO PLAYER
        if (cleanText.includes('tpa to it') || cleanText.includes('/tpa')) {
            setTimeout(() => {
                bot.chat('/tpa hoglin');
                console.log('--> Command Transmitted: /tpa hoglin');
            }, 1000);
            return;
        }

        // GO TO SPAWN
        if (cleanText.includes('/spawn') || cleanText.includes('run /spawn')) {
            if (cleanText.includes('executing')) return; 
            setTimeout(() => { bot.chat('/spawn'); }, 1000);
            return;
        }

        // COME ME / PHYSICAL PATHFINDING
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
                console.log('--> Pathfinder target missing. Reverting to /tpa.');
                bot.chat('/tpa hoglin');
                return; 
            }
            
            // Cloud pathfinder configuration override
            const defaultMove = new movements(bot);
            defaultMove.canDig = false; // Prevent bot from breaking server lobby blocks
            bot.pathfinder.setMovements(defaultMove);
            bot.pathfinder.setGoal(new goals.GoalFollow(targetEntity, 1));
            return;
        }

        // COORDINATE TRANSLATOR
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
        console.log(`CRITICAL: Bot disconnected from server network. Reason given: ${reason}. Reboots in 10s...`);
        setTimeout(() => { createBot(); }, 10000);
    });

    bot.on('error', (err) => { 
        console.log('HANDLED ERROR: ', err.message); 
    });
}

createBot();
