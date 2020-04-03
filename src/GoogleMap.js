import React, { useEffect, useState} from 'react'
import ReactGA from "react-ga";
import ausPop from './data/ausPop'

import NativeSelect from '@material-ui/core/NativeSelect'

import { Chart } from "react-google-charts";

function GoogleMap ({ province, newData }) {
    // Colour gradients for the map: https://material.io/design/color/#tools-for-picking-colors
    const redGradient = [
        '#ffefef',
        '#ffc0b1',
        '#ff8c71',
        '#ef1717'
        // '#9c0505'
    ];

    const purpleGradient = [
        '#F3E5F5',
        '#CE93D8',
        '#AB47BC',
        '#8E24AA'
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
  
  const [ myData, setMyData] = useState(null);
    useEffect(() => {

        let translate = {
            "NSW":"AU-NSW",
            "ACT":"AU-ACT",
            "NT":"AU-NT",
            "WA":"AU-WA",
            "VIC":"AU-VIC",
            "QLD":"AU-QLD",
            "SA":"AU-SA",
            "TAS":"AU-TAS",
        }
        
        // Set the hover label and colour gradient
        let label = "";
        switch(mapType) {
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
                setMapGradient(purpleGradient);
                break;
            case 'relative-tests':
                label = "Tests per million";
                setMapGradient(purpleGradient);
                break;
            case 'test-strike':
                label = "Test strike rate (%)";
                setMapGradient(purpleGradient);
                break;
        }
        let temp = [["state",label]];

        // Set data values
        for(let i = 0; i < newData.length; i++) {
            let value;
            switch(mapType) {
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
            temp.push([{v:translate[newData[i][0]], f:newData[i][0]}, parseInt(value)]);
        }

        setMyData(temp)

    }, [province, mapType]);

  const getOption = () => {
      return {
          region: 'AU', // ISO 3166-1 alpha-2 code for Australia
          colorAxis: { colors: mapGradient},
          backgroundColor: 'white',
          datalessRegionColor: 'rgb(216,221,224)',
          defaultColor: '#f5f5f5',
          resolution: 'provinces'
      }
  };

  const toggleData = (e) => {
      setMapType(e.target.value);
      ReactGA.event({category: 'casesMap',action: e.target.value});
  }

  return (
    loading ? <div className="loading">Loading...</div> :
    <div className="stateMap">
        <h2> Cases by State {province ? `· ${province.name}` : false} </h2>
        <span className="selection-grid">
            <NativeSelect
                className="mapToggle"
                onChange={toggleData}
            >
                <option value="confirmed-cases">Confirmed cases</option>
                <option value="relative-cases">Cases per million people</option>
                <option value="tested">Tested</option>
                <option value="relative-tests">Tests per million people</option>
                {/*<option value="deaths">Deaths</option>*/}

                <option value="test-strike">Positive test rate</option>
            </NativeSelect>
        </span>
        
        <Chart
            width= {window.innerWidth < 960?'100%':'auto'}
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
