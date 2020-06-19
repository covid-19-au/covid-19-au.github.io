import DataDownloader from "../CrawlerData/DataDownloader"


/**
 *
 * @returns {Promise<void>}
 * @constructor
 */
async function BarChart() {
    var dataDownloader = new DataDownloader();

    // Download country data by admin0
    // Note that countries don't have parent regions
    var countryCaseData = await dataDownloader.downloadCaseData(
        'admin0', ''
    );

    // Download state (Victoria) data by admin1
    var vicCaseData = await dataDownloader.downloadCaseData(
        'admin1', 'AU-VIC'
    );

    var auData = countryCaseData.getCaseNumberTimeSeries('AU');

    new CanvasJS({
        data: auData.getCanvasJSData()
    });
}

