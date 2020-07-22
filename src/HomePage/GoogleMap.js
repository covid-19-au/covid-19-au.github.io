import React, { useEffect, useState } from 'react'
import ReactGA from "react-ga";
import ausPop from '../data/ausPop'

import Acknowledgement from "../Acknowledgment"
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import Tooltip from '@material-ui/core/Tooltip';
import RadioGroup from '@material-ui/core/RadioGroup';

import { Chart } from "react-google-charts";
// import i18n bundle
import i18next from '../i18n';

function GoogleMap({ province, newData }) {
    // Colour gradients for the map: https://material.io/design/color/#tools-for-picking-colors
    const pinkGradient = [
        '#fee3eb',
        '#fa8cae',
        '#f75c8d',
        '#f0005c'
    ];

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
    const [mapType, setMapType] = useState('active-cases');
    const [mapGradient, setMapGradient] = useState(redGradient);

    useEffect(() => {

        setLoading(false)

    }, [province]);

    const [myData, setMyData] = useState(null);
    useEffect(() => {
        ReactGA.event({ category: 'casesMap', action: mapType });
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
            case 'active-cases':
                label = 'Active';
                setMapGradient(pinkGradient);
                break;
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
        let temp = mapType === "test-strike" ? [["state", label, { role: 'tooltip' }]] : [["state", label]];

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
                    value = Math.round(strikeRate * 100) / 100;
                    break;
                case 'active-cases':
                    value = newData[i][5];
                    break;
            }
            // Don't include if there's no data
            if (value === "N/A") { continue; }

            // v: Tooltip text, f: ISO region code
            mapType === 'test-strike' ?
                temp.push([{ v: translate[newData[i][0]], f: newData[i][0] }, parseFloat(value), "Test Positive Rate: " + parseFloat(value) + '%']) :
                temp.push([{ v: translate[newData[i][0]], f: newData[i][0] }, parseFloat(value)]);
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

    // const toggleData = (value) => {
    //     setMapType(value);
    //     ReactGA.event({ category: 'casesMap', action: value});
    //
    // }



    const activeStyles = {
        color: 'black',
        borderColor: '#8ccfff',
        // backgroundColor: '#e6ffff',
        padding: "1px",
        zIndex: 10,
        outline: "none",
        paddingLeft: "5px",
        paddingRight: "5px",
        fontSize: "80%",
        marginBottom: "1rem"
    };
    const activeStylesPink = {
        color: 'black',
        borderColor: '#f75c8d',
        // backgroundColor: '#ffe6e6',
        padding: "1px",
        zIndex: 10,
        outline: "none",
        paddingLeft: "5px",
        paddingRight: "5px",
        fontSize: "80%",
        marginBottom: "1rem"
    };
    const activeStylesRed = {
        color: 'black',
        borderColor: '#ff7e5f',
        // backgroundColor: '#ffe6e6',
        padding: "1px",
        zIndex: 10,
        outline: "none",
        paddingLeft: "5px",
        paddingRight: "5px",
        fontSize: "80%",
        marginBottom: "1rem"
    };
    const inactiveStyles = {
        color: 'grey',
        borderColor: '#e3f3ff',
        padding: "1px",
        outline: "none",
        paddingLeft: "5px",
        paddingRight: "5px",
        fontSize: "80%",
        marginBottom: "1rem"
    };
    const inactiveStylesRed = {
        color: 'grey',
        borderColor: '#fce7e6',
        padding: "1px",
        outline: "none",
        paddingLeft: "5px",
        paddingRight: "5px",
        fontSize: "80%",
        marginBottom: "1rem"
    };


    const handleChange = (mapType) => {
        setMapType(mapType.target.value);
    };

    return (
        loading ? <div className="loading">{i18next.t("homePage:misc.loadingText")}</div> :
            <div className="stateMap">
                <h2 style={{ display: "flex" }} aria-label="Cases of COVID 19 by state">{i18next.t("homePage:caseByState.title")}{province ? `· ${province.name}` : false}
                    <div style={{ alignSelf: "flex-end", marginLeft: "auto", fontSize: "60%" }}>
                        <Acknowledgement>
                        </Acknowledgement></div>

                </h2>

                {i18next.t("homePage:caseByState.buttonPrompt")}&nbsp;
                <ButtonGroup aria-label="small outlined button group">

                    <Tooltip title="Current active cases" arrow>
                        <Button style={mapType === "active-cases" ? activeStylesPink : inactiveStylesRed} value="active-cases" onClick={() => setMapType("active-cases")}>Active</Button>
                    </Tooltip>
                    <Tooltip title="Confirmed cases so far" arrow>
                        <Button style={mapType === "confirmed-cases" ? activeStylesRed : inactiveStylesRed} value="confirmed-cases" onClick={() => setMapType("confirmed-cases")}>{i18next.t("homePage:status.Cases")}</Button>
                    </Tooltip>
                    <Tooltip title="Confirmed cases per million people" arrow>
                        <Button style={mapType === "relative-cases" ? activeStylesRed : inactiveStylesRed} value="relative-cases" onClick={() => setMapType("relative-cases")}>{i18next.t("homePage:status.casePM")}</Button>
                    </Tooltip>
                    <Tooltip title="Tests carried out so far" arrow>
                        <Button style={mapType === "tested" ? activeStyles : inactiveStyles} value="tested" onClick={() => setMapType("tested")}>{i18next.t("homePage:status.Tested")}</Button>
                    </Tooltip>
                    <Tooltip title="Tests carried out per million people" arrow>
                        <Button style={mapType === "relative-tests" ? activeStyles : inactiveStyles} value="relative-tests" onClick={() => setMapType("relative-tests")}>{i18next.t("homePage:status.testPM")}</Button>
                    </Tooltip>
                    <Tooltip title="Percentage of positive test cases" arrow>
                        <Button style={mapType === "test-strike" ? activeStyles : inactiveStyles} value="test-strike" onClick={() => setMapType("test-strike")}>{i18next.t("homePage:status.positiveP")}</Button>
                    </Tooltip>
                </ButtonGroup>


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
