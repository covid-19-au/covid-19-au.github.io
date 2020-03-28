import React, { useEffect, useState} from 'react'

import ausPop from './data/ausPop'

import Button from '@material-ui/core/Button'
import { Chart } from "react-google-charts";


function GoogleMap ({ province, newData }) {

  const [loading, setLoading] = useState(true);
  const [relativeEnabled, setRelativeEnabled] = useState(false);

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
        let temp = relativeEnabled ? [["state", "Cases per million"]] : [["state","Confirmed"]]
        for(let i = 0; i < newData.length; i++) {
            // Add each data row.
            if (!relativeEnabled) {
                // Default mode: Display number of cases
                // v: Tooltip text, f: ISO region code
                temp.push([{v:translate[newData[i][0]], f:newData[i][0]}, parseInt(newData[i][1])]);
            } else {
                // Relative mode: Display cases per 1M pop
                let proportionConfirmed = (newData[i][1] * 1000000) / ausPop[newData[i][0]];
                proportionConfirmed = Math.round(proportionConfirmed);
                temp.push([{v:translate[newData[i][0]], f:newData[i][0]}, proportionConfirmed]);
            }
        }

        setMyData(temp)

    }, [province, relativeEnabled]);

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

  const toggleData = () => {
      setRelativeEnabled(!relativeEnabled);
  }

  return (
    loading ? <div className="loading">Loading...</div> :
    <div className="stateMap">
        <span className="mapHeading">
            <h2> Cases by State {province ? `· ${province.name}` : false} </h2>
            <Button onClick={() => toggleData()} variant="outlined" color="primary" className="mapToggle" disableTouchRipple={true}>
                {relativeEnabled ? 'Confirmed cases' : 'Cases per 1 million people'}
            </Button>
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
