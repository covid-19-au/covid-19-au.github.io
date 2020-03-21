import React, { useEffect, useState } from 'react'

import { Chart } from "react-google-charts";



function GoogleMap ({ province, newData }) {
    const keys = [
        "State",
        "Confirmed",
        "Deaths",
        "Recovered"
    ];

  const [loading, setLoading] = useState(true);
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
        let temp = [["state","Confirmed"]]
        for(let i = 0; i < newData.length; i++)
        {
            // Add each data row.
            // v: Tooltip text, f: ISO region code
            temp.push([{v:translate[newData[i][0]], f:newData[i][0]}, parseInt(newData[i][1])])
        }

        setMyData(temp)

    }, [province]);

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

  return (
    loading ? <div className="loading">Loading...</div> :
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
  )
}

export default GoogleMap
