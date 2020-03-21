const https = require('https');



function downloadData(dataUrl, writePath) {

    https.get('https://sheets.googleapis.com/v4/spreadsheets/1N3YWRf3CqbIfzZeyRXHr7G6u-FEXqWa2zbzXBrTx7y4/values:batchGet?ranges=Sheet1&majorDimension=COLUMNS&key=AIzaSyCdVGuu4uV0CObdlZKkoci1RgY4N-lBvDw', (resp) => {
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
            console.log(formattedData)
            console.log(requiredData)
            var i = 1
            while (i < requiredData[0].length) {
                formattedData[requiredData[0][i]] = []
                i = i + 1
            }
            i = 1
            j = 1


            console.log(formattedData)



            //var i = require





        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}
downloadData()