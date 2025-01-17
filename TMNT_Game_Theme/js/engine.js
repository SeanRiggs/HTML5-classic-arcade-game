/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

var app = app || {};

function between(x, min, max) {
    return x >= min && x <= max;
}

(function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    app.GAME_CONFIG = {
        CANVAS_WIDTH: 505,
        CANVAS_HEIGHT: 606,
        TILE_HEIGHT: 70,
        TILE_WIDTH: 100
    }
    app.ACTORS = {
        player: new app.Player(),
        allEnemies: [new app.Enemy(70), new app.Enemy(140), new app.Enemy(210)],
        gem: new app.Gem(),
        heart: new app.Heart()
    }

    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime, requestAnimationFrameID;
    
    app.ctx = ctx;

    canvas.width = app.GAME_CONFIG.CANVAS_WIDTH;
    canvas.height = app.GAME_CONFIG.CANVAS_HEIGHT;
    doc.body.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        requestAnimationFrameID = win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        updateEntities(dt);
        checkCollisions();
    }

    function checkCollisions() {
        var allEnemies = app.ACTORS.allEnemies,
        player = app.ACTORS.player,
        heart = app.ACTORS.heart,
        gem = app.ACTORS.gem;

        allEnemies.forEach(function(enemy) {
            if(between(player.x, (enemy.x - 60), (enemy.x + 60)) && between(player.y, (enemy.y - 10), (enemy.y + 10))) {
                player.life--;
                init();
            }
        });
        if(between(player.x, (gem.x - 60), (gem.x + 60)) && between(player.y, (gem.y - 10), (gem.y + 10))) {
            player.score++;
            gem.update();
            init();
        }
        if(between(player.x, (heart.x - 60), (heart.x + 60)) && between(player.y, (heart.y - 10), (heart.y + 10))) {
            player.life++;
            heart.notVisible = true;
            reset();
        }
     }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        var allEnemies = app.ACTORS.allEnemies,
        heart = app.ACTORS.heart;

        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        heart.update();
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 3 of stone
                'images/stone-block.png',   // Row 2 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/grass-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png'    // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }

        renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        var allEnemies = app.ACTORS.allEnemies,
        player = app.ACTORS.player,
        heart = app.ACTORS.heart,
        gem = app.ACTORS.gem;

        gem.render();
        heart.render();
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });
        player.renderText();
        player.render();
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        var allEnemies = app.ACTORS.allEnemies,
        player = app.ACTORS.player,
        heart = app.ACTORS.heart,
        gem = app.ACTORS.gem;

        player.x = 200;
        player.y = 350;
        heart.x = -100;
        allEnemies.forEach(function(enemy) {
            enemy.newWave();
        });
        win.cancelAnimationFrame(requestAnimationFrameID);
        // requestAnimationFrameID = win.requestAnimationFrame(main);
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/shredder-ico.png',
        'images/leo-ico.png',
        'images/pizza-ico.png',
        'images/money-ico.png',
        'images/TurtleVan-ico.png',
        'images/pizza-box.png',
        'images/Casey-Jones.png',
        'images/splinter-ico.png',
        'images/logo-ico.png',
        'images/april-ico.png',
        'images/fsoldier2.png',
        'images/100pts.png',
        'images/baxter.png',
        'images/bebop.png',
        'images/Rocksteady2.png',
        'images/krang.png',
        'images/raph-ico.png',
        'images/150pts.png',
        'images/manhole-game-ico.png',
        'images/200pts.png',
        'images/RiggsCat.png',
        'images/boo.png',
        'images/shark.png',
        'images/pizzacomp.png',
        'images/Heart.png'
    ]);
    Resources.onReady(init);
})(this);
