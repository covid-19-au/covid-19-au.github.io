import React, { useEffect, useState } from 'react'
import ReactGA from "react-ga";
import ausPop from '../data/ausPop'

import Acknowledgement from "../Acknowledgment"

import { Chart } from "react-google-charts";

function GoogleMap({ province, newData }) {
    // Colour gradients for the map: https://material.io/design/color/#tools-for-picking-colors
    const redGradient = [
        '#fce7e6',
        '#ffc8b9',
        '#ff7e5f',
        '#e73210'
    ];

    const blueGradient = [
        '#e3f3ff',
        '#8ccfff',
        '#24adff',
        '#008fff'
    ];

    const yellowGradient = [
        '#FFFDE7',
        '#FFF59D',
        '#FFEE58',
        '#FDD835'
    ];

    const [loading, setLoading] = useState(true);
    const [mapType, setMapType] = useState('confirmed-cases');
    const [mapGradient, setMapGradient] = useState(redGradient);

    useEffect(() => {

        setLoading(false)

    }, [province]);

    const [myData, setMyData] = useState(null);
    useEffect(() => {

        let translate = {
            "NSW": "AU-NSW",
            "ACT": "AU-ACT",
            "NT": "AU-NT",
            "WA": "AU-WA",
            "VIC": "AU-VIC",
            "QLD": "AU-QLD",
            "SA": "AU-SA",
            "TAS": "AU-TAS",
        }

        // Set the hover label and colour gradient
        let label = "";
        switch (mapType) {
            case 'confirmed-cases':
                label = 'Confirmed';
                setMapGradient(redGradient);
                break;
            case 'relative-cases':
                label = "Cases per million";
                setMapGradient(redGradient);
                break;
            case 'deaths':
                label = "Deaths";
                setMapGradient(redGradient);
                break;
            case 'tested':
                label = "Tested"
                setMapGradient(blueGradient);
                break;
            case 'relative-tests':
                label = "Tests per million";
                setMapGradient(blueGradient);
                break;
            case 'test-strike':
                label = "Test strike rate (%)";
                setMapGradient(blueGradient);
                break;
        }
        let temp = [["state", label]];

        // Set data values
        for (let i = 0; i < newData.length; i++) {
            let value;
            switch (mapType) {
                case 'confirmed-cases':
                    value = newData[i][1];
                    break;
                case 'relative-cases':
                    if (newData[i][1] === "N/A") { continue; }
                    let proportionConfirmed = (newData[i][1] * 1000000) / ausPop[newData[i][0]];
                    value = Math.round(proportionConfirmed);
                    break;
                case 'deaths':
                    value = newData[i][2];
                    break;
                case 'tested':
                    value = newData[i][4];
                    break;
                case 'relative-tests':
                    if (newData[i][4] === "N/A") { continue; }
                    let proportionTested = (newData[i][4] * 1000000) / ausPop[newData[i][0]];
                    value = Math.round(proportionTested);
                    break;
                case 'test-strike':
                    if (newData[i][4] === "N/A" || newData[i][1] === "N/A") { continue; }
                    let strikeRate = newData[i][1] / newData[i][4] * 100;
                    // 1 decimal place
                    value = Math.round(strikeRate);
                    break;
            }
            // Don't include if there's no data
            if (value === "N/A") { continue; }

            // v: Tooltip text, f: ISO region code
            temp.push([{ v: translate[newData[i][0]], f: newData[i][0] }, parseInt(value)]);
        }

        setMyData(temp)

    }, [province, mapType]);


    const getOption = () => {
        return {
            region: 'AU', // ISO 3166-1 alpha-2 code for Australia
            colorAxis: { colors: mapGradient },
            backgroundColor: 'white',
            datalessRegionColor: 'rgb(216,221,224)',
            defaultColor: '#f5f5f5',
            resolution: 'provinces'
        }
    };

    const toggleData = (e) => {
        setMapType(e.target.value);
        ReactGA.event({ category: 'casesMap', action: e.target.value });

    }

    return (
        loading ? <div className="loading">Loading...</div> :
            <div className="stateMap">
                <h2 style={{ display: "flex" }}>Cases by State {province ? `· ${province.name}` : false}
                    <div style={{ alignSelf: "flex-end", marginLeft: "auto", fontSize: "60%" }}>
                        <Acknowledgement>
                        </Acknowledgement></div>

                </h2>
                <noscript>
                <div>
                  <button type="button" data-toggle="button" class="btn btn-danger btn-sm" aria-pressed="true" value="confirmed-cases" onClick={toggleData}>CONFIRMED CASES</button>
                  <button type="button" data-toggle="button" class="btn btn-danger btn-sm" value="relative-cases" onClick={toggleData}>&nbsp;CASES/MILLION PEOPLE</button>
                  <button type="button" data-toggle="button" class="btn btn-primary btn-sm" value="tested" onClick={toggleData}>&nbsp;TESTED</button>
                  <button type="button" data-toggle="button" class="btn btn-primary btn-sm" value="relative-tests" onClick={toggleData}>&nbsp;TESTS/MILLION PEOPLE</button>
                  <button type="button" data-toggle="button" class="btn btn-primary btn-sm" value="test-strike" onClick={toggleData}>&nbsp;POSITIVE TEST RATE</button>
                </div>
                </noscript>

                <div><button class="btn btn-secondary btn-sm" type="button" html="true" disabled><h4><em>Select Map Type</em></h4></button></div>

                <div class="btn-group-sm btn-group-toggle" data-toggle="buttons">
                  <label class="btn btn-danger active">
                    <input type="radio" name="options" id="option1" autocomplete="off" checked value="confirmed-cases" onClick={toggleData}/>CONFIRMED CASES
                  </label>
                  <label class="btn btn-danger">
                    <input type="radio" name="options" id="option1" autocomplete="off" value="relative-cases" onClick={toggleData}/>CASES/MILLION PEOPLE
                  </label>
                  <label class="btn btn-primary">
                    <input type="radio" name="options" id="option1" autocomplete="off" value="tested" onClick={toggleData}/>TESTED
                  </label>
                  <label class="btn btn-primary">
                    <input type="radio" name="options" id="option1" autocomplete="off" value="relative-tests" onClick={toggleData}/>TESTS/MILLION PEOPLE
                  </label>
                  <label class="btn btn-primary">
                    <input type="radio" name="options" id="option1" autocomplete="off" value="test-strike" onClick={toggleData}/>POSITIVE TEST RATE
                  </label>
                </div>

                <Chart
                    width={window.innerWidth < 960 ? '100%' : 'auto'}
                    left="auto"
                    align="right"
                    top="40%"
                    chartType="GeoChart"
                    data={myData}
                    options={getOption()}
                    // Note: you will need to get a mapsApiKey for your project.
                    // See: https://developers.google.com/chart/interactive/docs/basic_load_libs#load-settings
                    mapsApiKey="YOUR_KEY_HERE"
                    rootProps={{ 'data-testid': '3' }}
                />
            </div>
    )
}

export default GoogleMap
