var util = require('util');
var AWS = require("aws-sdk");
var fs = require('fs');
var Q = require('Q');

AWS.config.update({
    region: "eu-west-1"
});

var docClient = new AWS.DynamoDB.DocumentClient();

getBannedUsers();

// ------------------------------------------
function unbanUser(userName) {
    var params = {
        TableName: "UserConfig",
        Key: {
            "userName": userName
        },
        UpdateExpression: "set banned = :b",
        ExpressionAttributeValues: {
            ':b': false
        },
        ReturnValues: "UPDATED_NEW"
    };

    console.log('Unbanning ' + userName + '...')

    docClient.update(params, function(err, data) {
        if (err) {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("UpdateItem succeeded!");
        }
    });
}

function getBannedUsers() {
    var params = {
        TableName: "UserConfig",
        ProjectionExpression: "userName",
        FilterExpression: "banned = :b",
        ExpressionAttributeValues: {
            ':b': true
        }
    }

    console.log("Scanning for banned users ...");
    docClient.scan(params, onScan);

    function onScan(err, data) {
        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            // print all the movies
            console.log("Scan succeeded.");
            data.Items.forEach(function(user) {
                unbanUser(user.userName);
            });

            // continue scanning if we have more movies
            if (typeof data.LastEvaluatedKey != "undefined") {
                console.log("Scanning for more...");
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                docClient.scan(params, onScan);
            }
        }
    }
}
