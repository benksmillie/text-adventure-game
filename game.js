const output = document.getElementById('output');
const input = document.getElementById('input');

const gameState = {
    location: 'dark_room',
    inventory: [],
    flags: {},
    discovered: ['dark_room'],
    combat: null
};

const worldMap = {
    locations: [
        { id: 'dark_room', name: 'Dark Room', x: 150, y: 350, act: 1 },
        { id: 'catacombs', name: 'Catacombs', x: 150, y: 310, act: 2 },
        { id: 'necromancer_study', name: 'Necromancer\'s Study', x: 130, y: 270, act: 2 },
        { id: 'prison_complex', name: 'Prison Complex', x: 150, y: 230, act: 3 },
        { id: 'ashenmoor', name: 'Ashenmoor', x: 150, y: 190, act: 4 },
        { id: 'whispering_forest', name: 'Forest', x: 180, y: 160, act: 4 },
        { id: 'millhaven', name: 'Millhaven', x: 210, y: 130, act: 5 },
        { id: 'marshlands', name: 'Marshlands', x: 230, y: 100, act: 5 },
        { id: 'highreach', name: 'Highreach', x: 220, y: 70, act: 6 },
        { id: 'frostpeak', name: 'Frostpeak Pass', x: 180, y: 50, act: 6 },
        { id: 'blighted_plains', name: 'Blighted Plains', x: 140, y: 40, act: 7 },
        { id: 'castle_grimhold', name: 'Castle Grimhold', x: 100, y: 20, act: 8 }
    ],
    paths: [
        ['dark_room', 'catacombs'],
        ['catacombs', 'necromancer_study'],
        ['necromancer_study', 'prison_complex'],
        ['prison_complex', 'ashenmoor'],
        ['ashenmoor', 'whispering_forest'],
        ['whispering_forest', 'millhaven'],
        ['millhaven', 'marshlands'],
        ['marshlands', 'highreach'],
        ['highreach', 'frostpeak'],
        ['frostpeak', 'blighted_plains'],
        ['blighted_plains', 'castle_grimhold']
    ]
};

const locations = {
    dark_room: {
        description: 'You awaken in a cold, dark room. Stone walls press in around you. You feel a damp chill in the air. A single wooden door stands before you.',
        hints: [
            'Try searching the room for items that might help.',
            'Examine objects closely to understand your surroundings.',
            'You need to find something to unlock the door.'
        ],
        solution: {
            text: 'You gather the three crystal fragments scattered in the darkness. As they come together, they glow brilliantly, forming a key of pure light. The symbols on the door respond to the light, and the lock clicks open.',
            nextLocation: 'catacombs'
        },
        commands: {
            'look': 'The room is almost pitch black. You can barely make out the outline of a door.',
            'examine door': 'The door is made of ancient oak, with strange symbols carved into it.',
            'open door': 'The door is locked. You\'ll need to find a way to open it.',
            'search': 'You feel around in the darkness and find a small glowing crystal fragment.',
            'help': 'Available commands: look, examine [object], search, inventory, hint, solve, help, quit'
        }
    },
    catacombs: {
        description: 'You step into ancient catacombs. The air reeks of decay and forgotten magic. Pale blue crystals embedded in the walls cast eerie shadows. A spectral figure materializes before you.',
        hints: [
            'The wraith seems bound by duty, not malice.',
            'Listen to the riddle carefully: "I speak without a mouth and hear without ears."',
            'The answer is something that comes back to you.'
        ],
        solution: {
            text: 'You speak the word "Echo" with confidence. The wraith shudders and its form becomes clear. "You have freed me from my binding," it whispers. "I am Echo, guardian no more. Pass, heir of Thornwick." The wraith dissipates, and the path forward opens.',
            nextLocation: 'necromancer_study'
        },
        commands: {
            'look': 'The catacombs stretch into darkness. A ghostly wraith blocks your path.',
            'examine wraith': 'The wraith speaks: "I speak without a mouth and hear without ears. I have no body, but come alive with fears. Speak my name to pass."',
            'help': 'Available commands: look, examine [object], inventory, hint, solve, help, quit'
        }
    },
    necromancer_study: {
        description: 'You enter a chamber filled with arcane artifacts and dusty tomes. This is Mordeth the Soulbinder\'s study. Dark energy still lingers in the air.',
        hints: [
            'The journals on the desk might contain valuable information.',
            'Your Thornwick bloodline is significant.',
            'Magic can be learned from these texts.'
        ],
        solution: {
            text: 'You decipher Mordeth\'s journals, learning the truth: you were imprisoned because your bloodline can banish the Shadow Lord. As understanding dawns, power awakens within you. Your hands glow with soft light—you\'ve learned your first spell: Luminous Ward.',
            nextLocation: 'prison_complex'
        },
        commands: {
            'look': 'Books and scrolls cover every surface. A journal lies open on the desk.',
            'examine journal': 'The journal speaks of the Thornwick bloodline and its power over shadow magic.',
            'help': 'Available commands: look, examine [object], inventory, hint, solve, help, quit'
        }
    },
    prison_complex: {
        description: 'You reach a larger fortress chamber. A jailor wraith materializes, its eyes burning with malice. "None shall pass!" it shrieks, drawing a spectral blade.',
        hints: [
            'You must defeat the jailor wraith in combat.',
            'Use the "challenge" command to engage in battle.',
            'Each attack deals 1-20 damage randomly.'
        ],
        enemy: {
            name: 'Jailor Wraith',
            hp: 50,
            maxHp: 50
        },
        solution: {
            text: 'With a final strike, the jailor wraith dissolves into mist. Its keys clatter to the ground. You\'ve proven yourself in combat and can now escape toward the surface.',
            nextLocation: 'ashenmoor'
        },
        commands: {
            'look': 'A fierce jailor wraith guards the passage ahead.',
            'examine wraith': 'The jailor wraith grips a spectral blade. It looks dangerous. HP: 50',
            'help': 'Available commands: look, examine [object], challenge, inventory, hint, solve, help, quit'
        }
    }
};

function writeOutput(text, className = '') {
    const line = document.createElement('div');
    line.className = `output-line ${className}`;
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

function writeCommand(command) {
    const line = document.createElement('div');
    line.className = 'output-line command-line';
    line.innerHTML = `<span class="prompt">></span>${command}`;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

function printWelcome() {
    const welcome = `
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        THE CHRONICLES OF SHADOWKEEP                       ║
║                                                           ║
║        A Text-Based Adventure Game                        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`;
    writeOutput(welcome, 'ascii-art');
    writeOutput('');
    writeOutput('Type "help" for available commands.', 'info');
    writeOutput('Type "start" to begin your journey.', 'info');
    writeOutput('Type "hint" if you get stuck, or "solve" to skip a challenge.', 'info');
    writeOutput('');
}

function handleCommand(command) {
    command = command.trim().toLowerCase();
    
    if (!command) return;
    
    writeCommand(command);
    
    // Check if in combat
    if (gameState.combat) {
        handleCombat(command);
        return;
    }
    
    // Global commands
    if (command === 'quit' || command === 'exit') {
        writeOutput('Thanks for playing!', 'success');
        return;
    }
    
    if (command === 'start') {
        writeOutput('');
        writeOutput(locations.dark_room.description);
        writeOutput('');
        drawMap();
        return;
    }
    
    if (command === 'inventory' || command === 'inv') {
        if (gameState.inventory.length === 0) {
            writeOutput('Your inventory is empty.', 'warning');
        } else {
            writeOutput('Inventory:', 'info');
            gameState.inventory.forEach(item => writeOutput(`  - ${item}`));
        }
        return;
    }
    
    if (command === 'clear' || command === 'cls') {
        output.innerHTML = '';
        return;
    }
    
    if (command === 'hint') {
        const location = locations[gameState.location];
        if (location && location.hints) {
            if (!gameState.flags[`${gameState.location}_hintIndex`]) {
                gameState.flags[`${gameState.location}_hintIndex`] = 0;
            }
            
            const hintIndex = gameState.flags[`${gameState.location}_hintIndex`];
            const hint = location.hints[hintIndex];
            
            writeOutput(`💡 Hint: ${hint}`, 'warning');
            
            // Cycle through hints
            gameState.flags[`${gameState.location}_hintIndex`] = (hintIndex + 1) % location.hints.length;
        } else {
            writeOutput('No hints available for this location.', 'info');
        }
        writeOutput('');
        return;
    }
    
    if (command === 'solve') {
        const location = locations[gameState.location];
        if (location && location.solution) {
            writeOutput('');
            writeOutput('=== CHALLENGE SOLVED ===', 'success');
            writeOutput('');
            writeOutput(location.solution.text);
            writeOutput('');
            
            // Progress to next location
            if (location.solution.nextLocation && locations[location.solution.nextLocation]) {
                gameState.location = location.solution.nextLocation;
                
                // Add to discovered locations
                if (!gameState.discovered.includes(location.solution.nextLocation)) {
                    gameState.discovered.push(location.solution.nextLocation);
                }
                
                writeOutput('--- JOURNEY CONTINUES ---', 'info');
                writeOutput('');
                writeOutput(locations[location.solution.nextLocation].description);
                drawMap();
            }
        } else {
            writeOutput('There is nothing to solve here.', 'error');
        }
        writeOutput('');
        return;
    }
    
    if (command === 'challenge') {
        const location = locations[gameState.location];
        if (location && location.enemy) {
            if (!gameState.combat) {
                // Initialize combat
                gameState.combat = {
                    enemy: location.enemy.name,
                    enemyHp: location.enemy.hp,
                    enemyMaxHp: location.enemy.maxHp
                };
                writeOutput('');
                writeOutput(`⚔️  COMBAT INITIATED WITH ${location.enemy.name.toUpperCase()} ⚔️`, 'warning');
                writeOutput('');
                writeOutput(`Enemy HP: ${gameState.combat.enemyHp}/${gameState.combat.enemyMaxHp}`, 'error');
                writeOutput('');
                writeOutput('Type "attack" to strike, or "flee" to retreat.', 'info');
                writeOutput('');
            }
        } else {
            writeOutput('There is no one to challenge here.', 'error');
            writeOutput('');
        }
        return;
    }
    
    // Location-specific commands
    const location = locations[gameState.location];
    if (location && location.commands[command]) {
        writeOutput(location.commands[command]);
        
        // Special actions
        if (command === 'search' && gameState.location === 'dark_room' && !gameState.flags.foundCrystal) {
            gameState.inventory.push('Glowing Crystal Fragment');
            gameState.flags.foundCrystal = true;
            writeOutput('Added to inventory: Glowing Crystal Fragment', 'success');
        }
    } else {
        writeOutput(`Unknown command: "${command}". Type "help" for available commands.`, 'error');
    }
    
    writeOutput('');
}

function handleCombat(command) {
    if (command === 'attack') {
        const damage = Math.floor(Math.random() * 20) + 1;
        gameState.combat.enemyHp -= damage;
        
        writeOutput(`You strike! Dealt ${damage} damage.`, 'success');
        writeOutput(`Enemy HP: ${Math.max(0, gameState.combat.enemyHp)}/${gameState.combat.enemyMaxHp}`, 'error');
        writeOutput('');
        
        if (gameState.combat.enemyHp <= 0) {
            writeOutput(`🏆 VICTORY! You defeated the ${gameState.combat.enemy}!`, 'success');
            writeOutput('');
            
            const location = locations[gameState.location];
            if (location.solution) {
                writeOutput(location.solution.text);
                writeOutput('');
                
                if (location.solution.nextLocation && locations[location.solution.nextLocation]) {
                    gameState.location = location.solution.nextLocation;
                    
                    if (!gameState.discovered.includes(location.solution.nextLocation)) {
                        gameState.discovered.push(location.solution.nextLocation);
                    }
                    
                    writeOutput('--- JOURNEY CONTINUES ---', 'info');
                    writeOutput('');
                    writeOutput(locations[location.solution.nextLocation].description);
                    drawMap();
                }
            }
            
            gameState.combat = null;
            writeOutput('');
        } else {
            const enemyDamage = Math.floor(Math.random() * 10) + 1;
            writeOutput(`The ${gameState.combat.enemy} retaliates! You take ${enemyDamage} damage.`, 'warning');
            writeOutput('');
        }
    } else if (command === 'flee') {
        writeOutput(`You retreat from the ${gameState.combat.enemy}!`, 'warning');
        writeOutput('');
        gameState.combat = null;
    } else {
        writeOutput('In combat, use: attack, flee', 'info');
        writeOutput('');
    }
}

// Event listeners
input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const command = input.value;
        handleCommand(command);
        input.value = '';
    }
});

function drawMap() {
    const svg = document.getElementById('mapSvg');
    svg.innerHTML = '';
    
    // Draw paths
    worldMap.paths.forEach(([fromId, toId]) => {
        const fromLoc = worldMap.locations.find(l => l.id === fromId);
        const toLoc = worldMap.locations.find(l => l.id === toId);
        
        if (!fromLoc || !toLoc) return;
        
        const isDiscovered = gameState.discovered.includes(fromId) && gameState.discovered.includes(toId);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', fromLoc.x);
        line.setAttribute('y1', fromLoc.y);
        line.setAttribute('x2', toLoc.x);
        line.setAttribute('y2', toLoc.y);
        line.setAttribute('class', isDiscovered ? 'path-line path-discovered' : 'path-line');
        svg.appendChild(line);
    });
    
    // Draw location nodes
    worldMap.locations.forEach(location => {
        const isDiscovered = gameState.discovered.includes(location.id);
        const isCurrent = gameState.location === location.id;
        
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', `map-location ${isCurrent ? 'location-current' : isDiscovered ? 'location-visited' : 'location-undiscovered'}`);
        
        // Location circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', location.x);
        circle.setAttribute('cy', location.y);
        circle.setAttribute('r', isCurrent ? 7 : 5);
        group.appendChild(circle);
        
        // Location label (only show if discovered)
        if (isDiscovered) {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', location.x);
            text.setAttribute('y', location.y + 18);
            text.textContent = location.name;
            group.appendChild(text);
        }
        
        svg.appendChild(group);
    });
}

// Initialize game
printWelcome();
drawMap();

// Keep input focused
document.addEventListener('click', () => {
    input.focus();
});

input.focus();
