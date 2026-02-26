const output = document.getElementById('output');
const input = document.getElementById('input');

const gameState = {
    location: 'dark_room',
    inventory: [],
    flags: {},
    discovered: ['dark_room']
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
        commands: {
            'look': 'The room is almost pitch black. You can barely make out the outline of a door.',
            'examine door': 'The door is made of ancient oak, with strange symbols carved into it.',
            'open door': 'The door is locked. You\'ll need to find a way to open it.',
            'search': 'You feel around in the darkness and find a small glowing crystal fragment.',
            'help': 'Available commands: look, examine [object], search, inventory, help, quit'
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
    writeOutput('');
}

function handleCommand(command) {
    command = command.trim().toLowerCase();
    
    if (!command) return;
    
    writeCommand(command);
    
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
