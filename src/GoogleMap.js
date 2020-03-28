import React, { useEffect, useState} from 'react'

import ausPop from './data/ausPop'

import Button from '@material-ui/core/Button'
import Select from '@material-ui/core/Select'
import NativeSelect from '@material-ui/core/NativeSelect'

import { Chart } from "react-google-charts";


function GoogleMap ({ province, newData }) {

  const [loading, setLoading] = useState(true);
  const [mapType, setMapType] = useState('confirmed-cases');

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
        
        // Set the hover label
        let label = "";
        switch(mapType) {
            case 'confirmed-cases':
                label = 'Confirmed';
                break;
            case 'relative-cases':
                label = "Cases per million";
                break;
            case 'deaths':
                label = "Deaths";
                break;
            case 'tested':
                label = "Tested"
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
                    let proportionConfirmed = (newData[i][1] * 1000000) / ausPop[newData[i][0]];
                    value = Math.round(proportionConfirmed);
                    break;
                case 'deaths':
                    value = newData[i][2];
                    break;
                case 'tested':
                    value = newData[i][4];
                    break;
            }
            // Assumption that N/A data is 0
            if (value === "N/A") { value = 0; }

            // v: Tooltip text, f: ISO region code
            temp.push([{v:translate[newData[i][0]], f:newData[i][0]}, parseInt(value)]);
        }

        setMyData(temp)

    }, [province, mapType]);

  const getOption = () => {
      return {
          region: 'AU', // ISO 3166-1 alpha-2 code for Australia
          colorAxis: { colors: [
                    '#ffefef',
                    '#ffc0b1',
                    '#ff8c71',
                    '#ef1717'
                    // '#9c0505'
              ] },
          backgroundColor: 'white',
          datalessRegionColor: 'rgb(216,221,224)',
          defaultColor: '#f5f5f5',
          resolution: 'provinces'
      }
  };

  const toggleData = (e) => {
      setMapType(e.target.value);
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
                <option value="relative-cases">Cases per million</option>
                <option value="deaths">Deaths</option>
                <option value="tested">Tested</option>
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
