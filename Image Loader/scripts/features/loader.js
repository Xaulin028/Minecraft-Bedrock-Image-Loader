import { HttpRequest, HttpHeader, HttpRequestMethod, http } from "@minecraft/server-net";
import { world, system } from '@minecraft/server';
import { base64 } from './image.js';

system.beforeEvents.watchdogTerminate.subscribe(eventData => eventData.cancel = true);

const colorsMap = new Map([
    ["000000", "black_concrete"], ["ffffff", "white_concrete"], ["ff0000", "red_concrete"],
    ["00ff00", "lime_concrete"], ["0000ff", "blue_concrete"], ["ffff00", "yellow_concrete"], 
    ["00ffff", "light_blue_concrete"], ["ff00ff", "magenta_concrete"], ["ffa502", "orange_concrete"],
    ["ffc800", "gold_block"], ["9801ff", "purple_concrete"], ["9b9b9b", "light_gray_concrete"],
    ["663300", "brown_concrete"], ["ffff66", "sponge"], ["ff006b", "pink_concrete"],
    ["ff99cc", "pink_wool"], ["ffe5cc", "white_terracotta"], ["c6a2a2", "light_gray_terracotta"],
    ["33363b", "gray_concrete"], ["6a696f", "smooth_stone"], ["9f5845", "raw_copper_block"],
    ["33701a", "green_concrete"], ["493a5a", "blue_terracotta"], ["030f5d", "lapis_block"],
    ["e3dbb0", "sandstone"], ["a1a7b1", "clay"], ["a472a3", "purpur_block"],
    ["4d494d", "netherite_block"], ["65f5e3", "diamond_block"], ["a04d4e", "pink_terracotta"],
    ["30181c", "nether_brick"], ["8f503f", "brick_block"], ["bda510", "hay_block"],
    ["b8945f", "beehive"], ["919191", "furnace"], ["997140", "barrel"], ["945d41", "noteblock"],
    ["941400", "redstone_block"], ["167e86", "warped_wart_block"], ["966c4a", "dirt"],
    ["5f9033", "grass_block"], ["6a4418", "podzol"], ["6a656a", "mycelium"],
    ["a97764", "granite"], ["9f6b58", "polished_granite"], ["8a8a8e", "andesite"],
    ["7c7f80", "polished_andesite"], ["c2a166", "stripped_oak_wood"], ["b4865a", "stripped_jungle_wood"],
    ["b5603e", "stripped_acacia_wood"], ["4a3a24", "stripped_dark_oak_wood"], ["dc989e", "stripped_cherry_wood"],
    ["44a19f", "stripped_warped_hyphae"], ["533e24", "stripped_spruce_wood"], ["a3913e", "stripped_bamboo_block"],
    ["e38a1d", "carved_pumpkin"], ["8cb3fe", "ice"], ["6b9dfb", "blue_ice"],
    ["927965", "dripstone_block"], ["495e27", "moss_block"], ["b9855c", "dirt_with_roots"],
    ["5a482c", "muddy_mangrove_roots"], ["6a6e6f", "tuff"], ["545454", "polished_tuff"],
    ["100c1c", "obsidian"], ["49372c", "soul_sand"], ["3d2e25", "soul_soil"],
    ["bb6622", "red_sandstone"], ["4a2c23", "ancient_debris"], ["5c5c5c", "basalt"],
    ["636363", "bedrock"], ["fbdc75", "bee_nest"], ["312c36", "blackstone"],
    ["4f4f4f", "blast_furnace"], ["cecaad", "bone_block"], ["9c7c4f", "allow"],
    ["717171", "deny"], ["fccbe7", "pink_concrete"], ["e6b3ad", "cherry_planks"],
    ["feac6d", "shroomlight"], ["af8f55", "chiseled_bookshelf"], ["3c3947", "chiseled_polished_blackstone"],
    ["151515", "coal_block"], ["7f7f7f", "coal_ore"], ["888788", "cobblestone"],
    ["738552", "mossy_cobblestone"], ["c26b4c", "copper_block"], ["23161f", "cracked_polished_blackstone_bricks"],
    ["ae693c", "crafting_table"], ["941818", "crimson_nylium"], ["2b0178", "crying_obsidian"],
    ["b26247", "cut_copper"], ["17dd62", "emerald_block"], ["e8f4b2", "end_bricks"],
    ["d5da94", "end_stone"], ["d7c185", "birch_planks"], ["855029", "glowstone"],
    ["907540", "grass_path"], ["965d43", "hardened_clay"], ["251610", "black_terracotta"],
    ["4c3223", "brown_terracotta"], ["3a2b24", "gray_terracotta"], ["4c532a", "green_terracotta"],
    ["555a5a", "cyan_terracotta"], ["677533", "lime_terracotta"], ["95576c", "magenta_terracotta"],
    ["a25326", "orange_terracotta"], ["734454", "purple_terracotta"], ["8d3b2e", "red_terracotta"],
    ["b98323", "yellow_terracotta"], ["fec234", "honey_block"], ["d87803", "honeycomb_block"],
    ["92b9fe", "packed_ice"], ["e6e6e6", "iron_block"], ["8f8f8f", "lodestone"],
    ["7f4234", "mangrove_planks"], ["6f9323", "melon_block"], ["46403e", "mud"],
    ["8c674f", "mud_bricks"], ["fcfacd", "ochre_froglight"], ["4fab90", "oxidized_copper"],
    ["51a48b", "oxidized_cut_copper"], ["89654d", "packed_mud"], ["fffefd", "pearlescent_froglight"],
    ["84c774", "sticky_piston"], ["ba6337", "acacia_planks"], ["492f17", "dark_oak_planks"],
    ["aa7954", "jungle_planks"], ["c29d62", "oak_planks"], ["7a5a34", "spruce_planks"],
    ["ecfbfb", "powder_snow"], ["eeeae6", "quartz_block"], ["9d573f", "raw_copper_block"],
    ["f7c431", "raw_gold_block"], ["af8e77", "raw_iron_block"], ["111b21", "sculk_catalyst"],
    ["e0eadd", "sea_lantern"], ["73c262", "slime"], ["36373f", "smithing_table"],
    ["e9e9e9", "diorite"], ["c8c9c8", "polished_diorite"], ["7f7f7f", "stonebrick"],
    ["ea4318", "tnt"], ["f8fdf8", "verdant_froglight"], ["456b52", "warped_nylium"],
    ["1c1c20", "black_wool"], ["3a40a6", "blue_wool"], ["764a2b", "brown_wool"],
    ["159295", "cyan_wool"], ["42494c", "gray_wool"], ["597417", "green_wool"],
    ["43bde1", "light_blue_wool"], ["77bf19", "lime_wool"], ["77bf19", "magenta_wool"],
    ["f87d1a", "orange_wool"], ["822db1", "purple_wool"], ["a82a23", "red_wool"], 
    ["95958f", "light_gray_wool"], ["f5f6f6", "white_wool"], ["fccf2f", "yellow_wool"],
    ["646464", "deepslate"], ["585858", "polished_deepslate"], ["414141", "cracked_deepslate_tiles"],
    ["6a344b", "crimson_planks"], ["287067", "warped_planks"], ["64479e", "amethyst_block"],
    ["440507", "red_nether_brick"], ["90552d", "redstone_lamp"]
]);


function processChunk(startX, startZ, endX, endZ) {
    const w = world.getDimension('overworld');
    const chunkSize = 25600;
    let max = false;

    const width = Math.abs(endX - startX);
    const height = Math.abs(endZ - startZ);

    const numTickingAreas = Math.ceil((width * height) / chunkSize);

    const deltaX = (endX - startX) / Math.ceil(width / Math.sqrt(chunkSize));
    const deltaZ = (endZ - startZ) / Math.ceil(height / Math.sqrt(chunkSize));

    for (let i = 0; i < numTickingAreas; i++) {
        const x1 = startX + (i % Math.ceil(width / Math.sqrt(chunkSize))) * deltaX;
        const z1 = startZ + Math.floor(i / Math.ceil(width / Math.sqrt(chunkSize))) * deltaZ;
        const x2 = Math.min(x1 + deltaX, endX);
        const z2 = Math.min(z1 + deltaZ, endZ);
        
        w.runCommand(`tickingarea add ${x1} 0 ${z1} ${x2} 255 ${z2} load${i + 1} true`);
        if (i + 1 > 10) {
            max = true
        }
    }
    if (max == true) {
        world.sendMessage(`The maximum number of tickingarea has been reached, errors may occur when placing blocks.`)
    }
}

function* processColorData(player, test, startX, startY, startZ, width, height) {
    let count = 0;
    let total = 0;
    let errors = 0;
    world.sendMessage("Placing blocks...");
    for (const value of Object.values(test)) {
        const isHexColor = /^[0-9A-F]{6}$/i.test(value[2]);
        if (isHexColor) {
            const lowerCaseValue = value[2].toLowerCase();
            const block = colorsMap.has(lowerCaseValue) ? colorsMap.get(lowerCaseValue) : null;
            if (block) {
                const x = parseInt(value[0]);
                const z = parseInt(value[1]);
                total++;
                if (count == 6400) {
                    player.teleport({ x: startX + x, y: startY + 64, z: startZ + z}, {facingLocation: { x: startX + x, y: startY, z: startZ + z }});
                    yield;
                    count = 0;
                }
                try {
                    player.dimension.getBlock({ x: startX + x, y: startY, z: startZ + z }).setType(block);
                    count++
                } catch {
                    player.teleport({ x: startX + x, y: startY + 64, z: startZ + z}, {facingLocation: { x: startX + x, y: startY, z: startZ + z }});
                    yield;
                        try {player.dimension.getBlock({ x: startX + x, y: startY, z: startZ + z }).setType(block);} catch {total--; errors++; console.log(`\x1b[38;2;255;0;0mAn error occurred while loading the block "\x1b[38;2;51;255;255m${startX + x}, ${startY}, ${startZ + z}\x1b[38;2;255;0;0m"\x1b[0m`) }
                    count++;
                }
            } else {
                world.sendMessage(`Invalid color: ${value[2]}`);
            }
        }
    }
    player.teleport({ x: startX + (width / 2), y: startY + 64, z: startZ + (height / 2) }, {facingLocation: { x: startX + (width / 2), y: startY, z: startZ + (height / 2) }})
    world.sendMessage("Done! " + total + " blocks were placed and " +  errors + " errors occurred");
    player.dimension.runCommand(`scoreboard players reset * error`);
    player.dimension.runCommand(`tickingarea remove_all`);
    console.clear()
}


async function load(player, image, type) {
    try {
        const url = `http://localhost/${type}`; // Change this
        const req = new HttpRequest(url);
        req.method = HttpRequestMethod.Post;
        req.body = image
        req.headers = [new HttpHeader("Content-Type", "application/json")];

        world.sendMessage("Connecting with the API...");
        const result = await http.request(req);
        world.sendMessage("Connected with the API!");
        const data = JSON.parse(result.body);

        world.sendMessage("Processing data...");
        if (!data) {
            world.sendMessage("Error processing data.");
            return;
        }

        let startX = 15000;
        let startY = 200;
        let startZ = 15000;
        const values = Object.values(data.values)
        const endX = startX + parseInt(values[values.length - 1][0])
        const endZ = startZ + parseInt(values[values.length - 1][1])
        processChunk(startX, startZ, endX, endZ)
        if (data.width > 256 || data.height > 256) {
            world.sendMessage('§mYour image is too large, errors may occur when placing the blocks, the recommended size for the image is §b256x256')
        }
        system.runTimeout(() => {system.runJob(processColorData(player, data.values, startX, startY, startZ, data.width, data.height))}, 20);

    } catch (error) {
        world.sendMessage(`Error processing image: ${error}`);
    }
}




world.beforeEvents.chatSend.subscribe((data) => {
    const player = data.sender
    let message = data.message
    const prefix = '!'
    if (message.startsWith(prefix + 'link')) {
        message = message.substring(prefix.length + 4).trim()
        data.cancel = true
        if (message.length > 0) {
            player.sendMessage(`Loading URL: §b${message}`)
            system.run(async () => {
                await load(player, message, 'url')
            })
        } else {
            player.sendMessage('You did not provide a link in the message')
        }
    }
    if (message.startsWith(prefix + 'base64')) {
        data.cancel = true
        if (base64[0].length > 0) {
            player.sendMessage('Loading Base64 Image')
            system.run(async () => {
                await load(player, base64[0], 'base64')
            })
        } else {
            player.sendMessage('You did not insert a base64 image string into the image.js file')
        }
    }
})