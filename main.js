// 2D Space Habitat Designer Game
// Built with Phaser.js 3.x

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#0a0a0a',
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    }
};

// Game variables
let game;
let habitatBoundary;
let modules = [];
let draggedModule = null;
let scoreText;
let instructionsText;
let adviceText;
let crewCapacity = 0;

// Module types configuration
const MODULE_TYPES = {
    SLEEP_POD: {
        name: 'Sleep Pod',
        color: 0x00ff00,
        crewSupport: 2,
        size: 60
    },
    KITCHEN: {
        name: 'Kitchen',
        color: 0xffff00,
        crewSupport: 1,
        size: 50
    },
    EXERCISE: {
        name: 'Exercise Area',
        color: 0x0080ff,
        crewSupport: 1,
        size: 55
    },
    STORAGE: {
        name: 'Storage',
        color: 0x8000ff,
        crewSupport: 0,
        size: 45
    },
    HYGIENE: {
        name: 'Hygiene',
        color: 0xff0000,
        crewSupport: 1,
        size: 40
    },
    COMMAND: {
        name: 'Command Center',
        color: 0xff8000,
        crewSupport: 1,
        size: 50
    }
};

// Initialize the game
console.log('Initializing game...');
console.log('Phaser version:', Phaser.VERSION);

try {
    game = new Phaser.Game(config);
    console.log('Game initialized successfully');
} catch (error) {
    console.error('Failed to initialize game:', error);
    document.getElementById('game-container').innerHTML =
        '<div style="color: white; padding: 20px; text-align: center;">' +
        '<h2>Game Initialization Failed</h2>' +
        '<p>Error: ' + error.message + '</p>' +
        '</div>';
}

function preload() {
    console.log('Preload function called');
    // Create starfield background
    this.load.image('star', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
}

function create() {
    console.log('Create function called');

    try {
        // Create starfield background
        console.log('Creating starfield...');
        createStarfield.call(this);

        // Create habitat boundary (circle)
        console.log('Creating habitat boundary...');
        habitatBoundary = this.add.circle(400, 300, 250, 0x1a1a2e, 0.3);
        habitatBoundary.setStrokeStyle(3, 0x4a4a6a);

        // Create UI elements
        console.log('Creating UI...');
        createUI.call(this);

        // Create module palette
        console.log('Creating module palette...');
        createModulePalette.call(this);

        // Add input handlers
        console.log('Adding input handlers...');
        this.input.on('pointerdown', onPointerDown, this);
        this.input.on('pointermove', onPointerMove, this);
        this.input.on('pointerup', onPointerUp, this);

        // Update initial score
        console.log('Updating score...');
        updateScore();
        updateAdvice();

        console.log('Create function completed successfully');
    } catch (error) {
        console.error('Error in create function:', error);
        // Show error on screen
        this.add.text(400, 300, 'Error: ' + error.message, {
            fontSize: '16px',
            fill: '#ff0000',
            backgroundColor: '#000000',
            padding: {
                x: 10,
                y: 5
            }
        }).setOrigin(0.5);
    }
}

function createStarfield() {
    console.log('createStarfield called');
    // Create random stars for space background
    for (let i = 0; i < 100; i++) {
        const x = Phaser.Math.Between(0, 800);
        const y = Phaser.Math.Between(0, 600);
        const star = this.add.circle(x, y, 1, 0xffffff, Phaser.Math.FloatBetween(0.3, 1));
        star.setAlpha(Phaser.Math.FloatBetween(0.5, 1));
    }
    console.log('Starfield created successfully');
}

function createUI() {
    // Instructions panel
    instructionsText = this.add.text(10, 10,
        'SPACE HABITAT DESIGNER\n' +
        'Drag modules from palette into habitat\n' +
        'Green outline = Valid placement\n' +
        'Red outline = Invalid (overlap/outside boundary)', {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: {
                x: 10,
                y: 5
            }
        }
    );

    // Score panel
    scoreText = this.add.text(10, 120, '', {
        fontSize: '18px',
        fill: '#00ff00',
        backgroundColor: '#000000',
        padding: {
            x: 10,
            y: 5
        }
    });

    // AI Advice panel
    adviceText = this.add.text(10, 180, '', {
        fontSize: '12px',
        fill: '#ffff00',
        backgroundColor: '#000000',
        padding: {
            x: 10,
            y: 5
        },
        wordWrap: {
            width: 300
        }
    });
}

function createModulePalette() {
    const startX = 650;
    const startY = 50;
    const spacing = 70;

    let index = 0;
    for (const [key, moduleType] of Object.entries(MODULE_TYPES)) {
        const x = startX;
        const y = startY + (index * spacing);

        // Create module sprite
        const module = this.add.rectangle(x, y, moduleType.size, moduleType.size, moduleType.color);
        module.setStrokeStyle(2, 0xffffff);
        module.setInteractive();
        module.moduleType = key;
        module.moduleData = moduleType;
        module.isPalette = true;

        // Add module label
        this.add.text(x, y + 35, moduleType.name, {
            fontSize: '10px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        modules.push(module);
        index++;
    }
}

function onPointerDown(pointer) {
    const module = this.input.hitTestPointer(pointer);

    if (module && module.isPalette) {
        // Create a new module instance
        const newModule = this.add.rectangle(
            pointer.x,
            pointer.y,
            module.moduleData.size,
            module.moduleData.size,
            module.moduleData.color
        );
        newModule.setStrokeStyle(2, 0xffffff);
        newModule.setInteractive();
        newModule.moduleType = module.moduleType;
        newModule.moduleData = module.moduleData;
        newModule.isPalette = false;
        newModule.isDragging = true;

        modules.push(newModule);
        draggedModule = newModule;

        // Update module validity
        updateModuleValidity(newModule);
    } else if (module && !module.isPalette) {
        // Start dragging existing module
        draggedModule = module;
        module.isDragging = true;
    }
}

function onPointerMove(pointer) {
    if (draggedModule && draggedModule.isDragging) {
        draggedModule.x = pointer.x;
        draggedModule.y = pointer.y;
        updateModuleValidity(draggedModule);
    }
}

function onPointerUp(pointer) {
    if (draggedModule) {
        draggedModule.isDragging = false;
        draggedModule = null;
        updateScore();
        updateAdvice();
    }
}

function updateModuleValidity(module) {
    if (module.isPalette) return;

    const isValid = isModulePlacementValid(module);
    const outlineColor = isValid ? 0x00ff00 : 0xff0000;
    module.setStrokeStyle(3, outlineColor);
}

function isModulePlacementValid(module) {
    // Check if module is within habitat boundary
    const distanceFromCenter = Phaser.Math.Distance.Between(400, 300, module.x, module.y);
    const radius = module.moduleData.size / 2;

    if (distanceFromCenter + radius > 250) {
        return false; // Outside boundary
    }

    // Check for overlaps with other modules
    for (const otherModule of modules) {
        if (otherModule === module || otherModule.isPalette) continue;

        const distance = Phaser.Math.Distance.Between(module.x, module.y, otherModule.x, otherModule.y);
        const minDistance = (module.moduleData.size + otherModule.moduleData.size) / 2;

        if (distance < minDistance) {
            return false; // Overlapping
        }
    }

    return true;
}

function updateScore() {
    crewCapacity = 0;
    let validModules = 0;

    for (const module of modules) {
        if (!module.isPalette && isModulePlacementValid(module)) {
            crewCapacity += module.moduleData.crewSupport;
            validModules++;
        }
    }

    scoreText.setText(`CREW SUPPORTED: ${crewCapacity}\nVALID MODULES: ${validModules}`);
}

function updateAdvice() {
    let advice = '';

    // Check for hygiene near kitchen
    const hygieneModules = modules.filter(m => !m.isPalette && m.moduleType === 'HYGIENE' && isModulePlacementValid(m));
    const kitchenModules = modules.filter(m => !m.isPalette && m.moduleType === 'KITCHEN' && isModulePlacementValid(m));

    for (const hygiene of hygieneModules) {
        for (const kitchen of kitchenModules) {
            const distance = Phaser.Math.Distance.Between(hygiene.x, hygiene.y, kitchen.x, kitchen.y);
            if (distance < 100) {
                advice += '⚠️ Move hygiene away from kitchen for safety!\n';
                break;
            }
        }
    }

    // Check for sleep pods near noisy areas
    const sleepPods = modules.filter(m => !m.isPalette && m.moduleType === 'SLEEP_POD' && isModulePlacementValid(m));
    const exerciseModules = modules.filter(m => !m.isPalette && m.moduleType === 'EXERCISE' && isModulePlacementValid(m));

    for (const sleepPod of sleepPods) {
        for (const exercise of exerciseModules) {
            const distance = Phaser.Math.Distance.Between(sleepPod.x, sleepPod.y, exercise.x, exercise.y);
            if (distance < 80) {
                advice += '⚠️ Consider placing sleep pods away from exercise areas!\n';
                break;
            }
        }
    }

    // General advice
    if (crewCapacity === 0) {
        advice += '💡 Place modules inside the habitat boundary to support crew!';
    } else if (crewCapacity >= 6) {
        advice += '🎉 Excellent habitat design! Maximum crew capacity reached!';
    } else {
        advice += '💡 Try adding more modules to increase crew capacity!';
    }

    adviceText.setText(advice || '💡 Drag modules from the palette to design your habitat!');
}

function update() {
    // Game update loop - currently empty but ready for future enhancements
}