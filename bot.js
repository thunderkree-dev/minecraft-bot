const mineflayer = require('mineflayer');
const { pathfinder, movements, goals } = require('mineflayer-pathfinder');
const http = require('http');

// Force Render logs to stream instantly
process.stdout.isTTY = true;

// Keep-alive web server to ensure Render stays online 24/7
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
        
        // Anti-kick anti-afk movements (Fixed arm swings)
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
        
        // 1. FIXED: Intelligent Registration handler with safe delays to evade firewalls
        if (cleanText.includes('/register') || cleanText.includes('register ')) {
            console.log('--> Register prompt detected. Waiting 6 seconds...');
            setTimeout(() => {
                bot.chat('/register Mnew1234 Mnew1234');
                console.log('--> Sent: /register Mnew1234 Mnew1234');
            }, 6000);
            return;
        }

        // 2. FIXED: Intelligent Login handler with safe delays to evade firewalls
        if (cleanText.includes('/login') || cleanText.includes('login ')) {
            console.log('--> Login prompt detected. Waiting 6 seconds...');
            setTimeout(() => {
                bot.chat('/login Mnew1234');
                console.log('--> Sent: /login Mnew1234');
            }, 6000);
            return;
        }

        // 3. FIXED TPA TRIGGER: Runs flawlessly when you whisper it "/tpa"
        if (cleanText.includes('tpa') || cleanText.includes('tpa to it')) {
            // Ignore messages sent by the bot itself to avoid infinite loops
            if (cleanText.includes('hogglin1')) return; 

            console.log('--> TPA requested by whisper! Waiting 3-second anti-cheat bypass delay...');
            setTimeout(() => {
                if (bot && bot.entity) {
                    bot.chat('/tpa hoglin');
                    console.log('--> SUCCESS: /tpa hoglin command sent into chat.');
                }
            }, 3000);
            return;
        }

        // 4. SPAWN COMMAND TRIGGER
        if (cleanText.includes('/spawn') || cleanText.includes('run /spawn')) {
            if (cleanText.includes('executing') || cleanText.includes('hogglin1')) return; 
            setTimeout(() => { bot.chat('/spawn'); }, 3000);
            return;
        }

        // 5. COME TO ME TRIGGER
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
                console.log('--> Cannot locate player model. Using /tpa instead.');
                setTimeout(() => { bot.chat('/tpa hoglin'); }, 3000);
                return; 
            }
            
            const defaultMove = new movements(bot);
            defaultMove.canDig = false; 
            bot.pathfinder.setMovements(defaultMove);
            bot.pathfinder.setGoal(new goals.GoalFollow(targetEntity, 1));
            return;
        }

        // 6. COORDINATE TRANSLATOR
        const coordMatches = cleanText.match(/(-?\d+(?:\.\d+)?)\s*[\/\s]\s*(-?\d+(?:\.\d+)?)\s*[\/\s]\s*(-?\d+(?:\.\d+)?)/);
        if (coordMatches) {
            if (cleanText.includes('moving to') || cleanText.includes('hogglin1')) return;
            const x = parseFloat(coordMatches[1]); 
            const y = parseFloat(coordMatches[2]); 
            const z = parseFloat(coordMatches[3]);

            if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
                console.log(`--> Moving toward coordinates X:${x} Y:${y} Z:${z}`);
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
