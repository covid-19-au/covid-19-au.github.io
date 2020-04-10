const https = require('https');
const fs = require('fs');

const token = 'AIzaSyCdVGuu4uV0CObdlZKkoci1RgY4N-lBvDw'
//Download State Case Data
function downloadStateCaseData(dataUrl, writePath) {

    //let token = process.env.REACT_APP_DRIVE_KEY;
    let url = 'https://sheets.googleapis.com/v4/spreadsheets/1N3YWRf3CqbIfzZeyRXHr7G6u-FEXqWa2zbzXBrTx7y4/values:batchGet?ranges=Sheet1&majorDimension=COLUMNS&key=' + token
    https.get(url, (resp) => {
        let data = '';
        //A chunk of data has been received.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        //The whole response has been received. Print out the result.
        resp.on('end', () => {
            const parsedData = JSON.parse(data)
            const requiredData = parsedData.valueRanges[0].values


            formattedData = JSON.parse('{}')
            formattedData["values"] = []
            let i = 1
            while (i < requiredData[0].length - 1) {
                formattedData.values.push([])
                formattedData.values[i - 1].push(requiredData[0][i])
                let j = 1
                while (j < requiredData.length - 1) {
                    formattedData.values[i - 1].push(requiredData[j][i])

                    j = j + 1
                }
                i = i + 1
            }
            let timeIndex = requiredData.length - 1
            //add updated time
            formattedData["updatedTime"] = requiredData[timeIndex][1]

            dataString = JSON.stringify(formattedData)
            fs.writeFile('../src/data/stateCaseData.json', dataString, function (err) {
                if (err) throw err;
                console.log('complete');
            });

        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}


// Download Timeline data
function downloadTimelineData(dataUrl, writePath) {

    // let token = process.env.REACT_APP_DRIVE_KEY;
    let url = 'https://sheets.googleapis.com/v4/spreadsheets/1uuE8cA5P1DY3gWpqUfD-wr4p2GSGhb87H1JtONg8_ec/values:batchGet?ranges=Sheet1&majorDimension=COLUMNS&key=' + token
    https.get(url, (resp) => {
        let data = '';
        //A chunk of data has been received.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        //The whole response has been received. Print out the result.
        resp.on('end', () => {
            const parsedData = JSON.parse(data)
            const requiredData = parsedData.valueRanges[0].values


            formattedData = JSON.parse('{}')
            formattedData["news"] = []
            let i = 1
            while (i < requiredData[0].length - 1) {
                formattedData.news.push(JSON.parse('{}'))
                formattedData.news[i - 1][requiredData[0][0]] = requiredData[0][i]
                let j = 1
                while (j < requiredData.length - 1) {
                    formattedData.news[i - 1][requiredData[j][0]] = requiredData[j][i]

                    j = j + 1
                }
                i = i + 1
            }

            let timeIndex = requiredData.length - 1
            //add updated time
            formattedData["updatedTime"] = requiredData[timeIndex][1]

            dataString = JSON.stringify(formattedData)
            fs.writeFile('../src/data/timelinedata.json', dataString, function (err) {
                if (err) throw err;
                console.log('complete');
            });

        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}
downloadStateCaseData()
downloadTimelineData()