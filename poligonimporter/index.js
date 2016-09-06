var fs = require('fs');
var togeojson = require('togeojson');
var jsdom = require('jsdom').jsdom;
var util = require('util');
var AWS = require("aws-sdk");

AWS.config.update({
    region: "eu-west-1"
});


var convertedPoints = convertPoints();
uploadPoints(convertedPoints);

function convertPoints() {
    var kml = jsdom(fs.readFileSync('poketerkep.kml', 'utf8'));
    var converted = togeojson.kml(kml);
    var points = [];

    console.log("Converting poligons from poketerkep.kml ...");

    for (var i = 0; i < converted.features.length; i++) {
        var feature = converted.features[i]
        var geometry = feature.geometry;

        if (geometry.type === "Polygon") {
            var splittedName = feature.properties.name.split('-');

            if(splittedName.length === 2) {
                var point = {
                    id: splittedName[1],
                    priority: parseInt(splittedName[0]),
                    vertices: processCoordinates(geometry.coordinates[0])
                }

                points.push(point);

                // console.log(util.inspect(point, false, null));
            }
        }
    }

    console.log("Done. " + points.length + " points were converted");

    return points;
}

function processCoordinates(coordinates) {
    var coords = [];

    for (var i = 0; i < coordinates.length; i++) {
        var coord = {
            latitude: coordinates[i][1],
            longitude: coordinates[i][0]
        }

        coords.push(coord);
    }

    return JSON.stringify(coords);
}

function uploadPoints(points) {
    var docClient = new AWS.DynamoDB.DocumentClient();

    for (var i = 0; i < points.length; i++) {
        var point = points[i];

        var params = {
            TableName: "scanPolygon",
            Item: point
        }

        docClient.put(params, function(err, data) {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                // console.log("Added point: " + JSON.stringify(data));
            }
        });
    }

}