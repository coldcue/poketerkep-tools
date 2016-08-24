var util = require('util');
var AWS = require("aws-sdk");
var fs = require('fs');

AWS.config.update({
    region: "eu-west-1"
});

var lines = fs.readFileSync('users.csv').toString().split('\n');

var users = [];
for (var i = 0; i < lines.length; i++) {
    if (lines[i]) {
        lineArr = lines[i].split(',');
        users.push({
            userName: lineArr[0].trim(),
            created: parseInt(lineArr[1].trim()),
            createdBy: lineArr[2].trim(),
            hash: lineArr[3].trim()
        });
    }
}

//TODO add check

console.log(JSON.stringify(users));

var userConfigs = [];

console.log('Uploading users...');
for (var i = 0; i < users.length; i++) {
    if (users[i]) {
        userConfigs.push({
            userName: users[i].userName,
            lastUsed: 0,
            created: users[i].created,
            banned: false
        });
    }
}

uploadUsers(userConfigs);

function uploadUsers(users) {
    var docClient = new AWS.DynamoDB.DocumentClient();

    for (var i = 0; i < users.length; i++) {
        var user = users[i];

        console.log(JSON.stringify(user));

        var params = {
            TableName: "UserConfig",
            Item: user
        }

        docClient.put(params, function(err, data) {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                //console.log("Added point: " + JSON.stringify(data));
            }
        });
    }

}
