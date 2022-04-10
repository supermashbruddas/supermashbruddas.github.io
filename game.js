const default_stocks = 1
const arena_width = 2000
const arena_height = 1100
const deathfloor = 2000

const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

const weed_bg = new Image()
weed_bg.src = 'images/whoaaaadude.webp'

let character_names = ['trump', 'stoner', 'faceman', 'faceman_shaman', 'knigh', 'utopian', 'shrek', 'monke']
let characters = [create_trump, create_stoner, create_faceman, create_faceman, create_knigh, create_utopian, create_shrek, create_monke]

let spawn_positions = [new Vector2(500, 0), new Vector2(1500, 0),  new Vector2(1000, 0)]
let ability_draw_locations = [new Vector2(200, 100), new Vector2(1000, 100), new Vector2(1800, 100)]

class PlayerMetadata {
    constructor(stocks, player, control, index) {
        this.stocks = stocks
        this.player = player
        this.control = control
        this.index = index
    }
}

var keys = {};
window.addEventListener("keydown",
    function(e) {
        keys[e.code] = true;
    },
false)
window.addEventListener('keyup',
    function(e){
        keys[e.code] = false;
    },
false)

function is_key_down(key) {
    return key in keys && keys[key]
}

class Control {
    constructor(directional, jump, buttons) {
        this.directional = directional
        this.jumpKey = jump
        this.buttonKeys = buttons
    }

    axes() {
        let dir = new Vector2(0, 0)
        if (is_key_down(this.directional[0])) {
            dir = dir.add(new Vector2(0, -1))
        }
        if (is_key_down(this.directional[1])) {
            dir = dir.add(new Vector2(-1, 0))
        }
        if (is_key_down(this.directional[2])) {
            dir = dir.add(new Vector2(0, 1))
        }
        if (is_key_down(this.directional[3])) {
            dir = dir.add(new Vector2(1, 0))
        }
        return dir
    }

    jump() {
        return is_key_down(this.jumpKey)
    }

    buttons() {
        let ret = []
        for (let i = 0; i < this.buttonKeys.length; i++) {
            ret.push(is_key_down(this.buttonKeys[i]))
        }
        return ret
    }
}
let player_controls = [
    new Control(['KeyW', 'KeyA', 'KeyS', 'KeyD'], 'Space', ['KeyX', 'KeyC', 'KeyV', 'KeyB']),
    new Control(['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'], 'ControlRight', ['KeyM', 'Comma', 'Period', 'Slash'])
]

let max_num_players = 0
let players = []
function connecthandler(player_control) {
    let index = character_names.indexOf(params['p' + (players.length + 1)])
    if (index === -1) {
        index = Math.floor(Math.random() * characters.length)
    }

    let stocks = params['stocks'] === undefined ? default_stocks : parseInt(params['stocks'])
    let player = create_player(
        characters[index], 
        player_control, 
        character_names[index], 
        spawn_positions[players.length], 
        ability_draw_locations[players.length]
    )
    players.push(new PlayerMetadata(stocks, player, player_control, index))
    max_num_players++
}

let map = null
let map_names = ['default', 'weedopolis']

let maps = {
    default : new Map([
        platform(1400, 1000, new Vector2(arena_width / 2, arena_height + 350)),
        platform_semisolid(300, 25, new Vector2(arena_width / 4, arena_height - 300)),
        platform_semisolid(300, 25, new Vector2(arena_width - arena_width / 4, arena_height - 300))
    ]),
    weedopolis : new Map([
            platform_semisolid(450, 25, new Vector2(arena_width / 2, arena_height - 200), 'purple'),
            platform_semisolid(300, 25, new Vector2(arena_width / 4, arena_height - 300), 'purple'),
            platform_semisolid(300, 25, new Vector2(arena_width - arena_width / 4, arena_height - 300), 'purple'),
            platform_semisolid(300, 25, new Vector2(arena_width / 8, arena_height - 250), 'purple'),
            platform_semisolid(300, 25, new Vector2(arena_width - arena_width / 8, arena_height - 250), 'purple')
        ],
        weed_bg
    )
}

function platform(width, height, position, color) {
    if (color === undefined) {
        color = 'black'
    }
    let rect = new RectComponent(new Vector2(0, 0), color)
    let platform_physical_properties = new PhysicalProperties(new Vector2(0, 0), Infinity, 0, new Vector2(width, height), 1, false)
    return new GameObject(position, platform_physical_properties, ["ground"], {display : rect})
}

function platform_semisolid(width, height, position, color) {
    if (color === undefined) {
        color = 'black'
    }
    let rect = new RectComponent(new Vector2(0, 0), color)
    let platform_physical_properties = new PhysicalProperties(new Vector2(0, 0), Infinity, 0, new Vector2(width, height), 1, false, true)
    return new GameObject(position, platform_physical_properties, ["ground"], {display : rect})
}

function init() {
    if(params['map'] === undefined) {
        map = maps[map_names[Math.floor(Math.random()*map_names.length)]]
    } else {
        map = maps[params['map']]
    }

    for (let i = 0; i < map.objects_to_spawn.length; i++) {
        all_objects.push(map.objects_to_spawn[i])
    }

    connecthandler(player_controls[0])
    connecthandler(player_controls[1])
}

function create_player(character_function, gamepad, skin_name, spawn_position, ability_draw_location) {
    let player = character_function(gamepad, spawn_position, ability_draw_location, skin_name)
    all_objects.push(player)
    return player
}

function draw_win_screen(winner) {
    drawText(winner.tags[0].toUpperCase() + ' WINS!', 'red', '100px serif', arena_width / 2, arena_height / 2, 'center')
}

function drawImageScaled(img, ctx) {
    var canvas = ctx.canvas;
    var hRatio = canvas.width  / img.width    ;
    var vRatio =  canvas.height / img.height  ;
    var ratio  = Math.max ( hRatio, vRatio );
    var centerShift_x = ( canvas.width - img.width*ratio ) / 2;
    var centerShift_y = ( canvas.height - img.height*ratio ) / 2;  
    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.drawImage(img, 0,0, img.width, img.height,
                       centerShift_x,centerShift_y,img.width*ratio, img.height*ratio);  
}

function gameloop() {
    let current_players = []
    for(let i = 0; i < all_objects.length; i++) {
        if(all_objects[i].tags.includes('player')) {
            current_players.push(all_objects[i])
        }
    }

    for (let i = 0; i < players.length; i++) {
        let player_alive = false
        for (let j = 0; j < current_players.length; j++) {
            if (players[i].player == current_players[j]) {
                player_alive = true
                break
            }
        }

        if (!player_alive && players[i].stocks > 0) {
            players[i].player = create_player(
                characters[players[i].index], 
                players[i].control, 
                character_names[players[i].index], 
                spawn_positions[i], 
                ability_draw_locations[i]
            )
            players[i].stocks--
        }
    }

    let num_players_alive = 0
    for(let i = 0; i < all_objects.length; i++) {
        if(all_objects[i].tags.includes('player')) {
            num_players_alive++
        }
    }


    if (num_players_alive === 1 && num_players_alive < max_num_players) {
        draw_win_screen(current_players[0])
        return
    }

    requestAnimationFrame(gameloop)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if(map.background_image !== undefined) {
        drawImageScaled(map.background_image, ctx)
    }

    // delete all objects with components that have `should_delete() === true` or are below the deathfloor
    let remaining_objects = []
    for (let i = 0; i < all_objects.length; i++) {
        let delete_object = component => component.should_delete !== undefined && component.should_delete()
        if (Object.values(all_objects[i].components).find(delete_object) === undefined && all_objects[i].position.y < deathfloor) {
            remaining_objects.push(all_objects[i])
        }
    }
    all_objects = remaining_objects

    handle_gravity()
    handle_collisions()

    // run the update and draw functions for each component in each object if they exist
    for (let i = 0; i < all_objects.length; i++) {
        Object.values(all_objects[i].components).forEach(component => {
            if (component.update !== undefined) {
                component.update()
            }
            if (component.draw !== undefined) {
                component.draw()
            }
        })
    }
    
    handle_position_update()

    for (let i = 0; i < players.length; i++) {
        let draw_loc = ability_draw_locations[i].add(new Vector2(0, 50))
        drawText(players[i].stocks + '', 'white', '50px serif', draw_loc.x, draw_loc.y, 'left')
    }
}

init()
gameloop()