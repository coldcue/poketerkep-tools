var atob = require('atob');
var btoa = require('btoa');

var pokemonIds = [];

console.log(pokemonIds);
var encoded = encodePokemonIdsToBase64(pokemonIds);
console.log(encoded);
console.log('Length: ' + encoded.length);

var decoded = decodePokemonIdsFromBase64(encoded);
console.log(decoded);


function encodePokemonIdsToBase64(pokemonIds) {
    // The offset before each 8 bit segments
    var offset = 0;
    var bytes = new Int8Array(91);

    // Iterate over 91 bytes. We need 91 bytes, so we have 91 * 8 = 728 maximum pokemon id, which is more than 721
    for (var byte_idx = 0; byte_idx < 91; byte_idx++) {
        var byte_value = 0;

        // Get the pokemons between the offset and offest+7
        var start = offset
        var end = offset + 7;

        for (var p_idx = 0; p_idx < pokemonIds.length; p_idx++) {
            var pokemon_id = pokemonIds[p_idx];

            if (pokemon_id >= start && pokemon_id <= end) {
                //Add the 2^pokemon_id to the segment value
                byte_value += Math.pow(2, pokemon_id - offset);
            }
        }

        offset += 8;
        bytes[byte_idx] = byte_value;
    }

    //Convert byte array to base64
    return btoa(String.fromCharCode.apply(null, bytes));
}

function decodePokemonIdsFromBase64(b64encoded) {
    // The offset before each bytes
    var offset = 0;
    var pokemons = [];
    var bytes = new Uint8Array(atob(b64encoded).split("").map(function(c) {
        return c.charCodeAt(0);
    }));

    // Iterate over 24 segments. We need 24 segments, so we have 32 * 24 = 786 maximum pokemon id
    for (var byte_idx = 0; byte_idx < bytes.length; byte_idx++) {
        var byte_value = bytes[byte_idx];

        for (var i = 0; i < 8; i++) {
            // Mask out other bits
            if ((byte_value & Math.pow(2, i)) != 0) {
                // If its set
                pokemons.push(offset + i);
            }
        }

        offset += 8;
    }

    return pokemons;
}
