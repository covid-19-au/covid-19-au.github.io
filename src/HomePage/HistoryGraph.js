import React, { useState, Suspense, useEffect } from "react";

import CanvasJSReact from "../assets/canvasjs.react";
let CanvasJSChart = CanvasJSReact.CanvasJSChart;

export default function HistoryGraph({ countryData }) {
    let today = Date.now();
    const [loading, setLoading] = useState(true);
    const [options, setOptions] = useState(null);
    const [newOpts, setNewOpts] = useState(null);
    useEffect(() => {
        let monthTrans = {
            0: "Jan",
            1: "Feb",
            2: "Mar",
            3: "Apr",
            4: "May",
            5: "Jun",
            6: "Jul",
            7: "Aug",
            8: "Sept",
            9: "Oct",
            10: "Nov",
            11: "Dec"
        };
        let historyData = [
            {
                type: "spline",
                name: "Confirmed",
                showInLegend: true,
                dataPoints: []
            },
            {
                type: "spline",
                name: "Deaths",
                showInLegend: true,
                dataPoints: []
            },
            {
                type: "spline",
                name: "Recovered",
                showInLegend: true,
                dataPoints: []
            }
        ];
        let newData = [
            {
                type: "stackedColumn",
                name: "New Cases",
                showInLegend: true,
                dataPoints: []
            },
            {
                type: "stackedColumn",
                name: "Deaths",
                showInLegend: true,
                dataPoints: []
            }
        ];
        let pre = [];
        for (let key in countryData) {
            let arr = key.split("-");
            let date = new Date(arr[0], arr[1] - 1, arr[2]);
            if ((today - date) / (1000 * 3600 * 24) <= 14) {
                let labelName = monthTrans[date.getMonth()] + " " + date.getDate().toString();
                historyData[0]["dataPoints"].push({
                    y: countryData[key][0],
                    label: labelName
                });
                historyData[1]["dataPoints"].push({
                    y: countryData[key][2],
                    label: labelName
                });
                historyData[2]["dataPoints"].push({
                    y: countryData[key][1],
                    label: labelName
                });
                newData[0]["dataPoints"].push({
                    y: countryData[key][0] - pre[0],
                    label: labelName
                });
                newData[1]["dataPoints"].push({
                    y: countryData[key][2] - pre[2],
                    label: labelName
                });
            }
            pre = countryData[key];
        }
        setOptions({
            animationEnabled: true,
            height: 314,
            title: {
                text: "Overall trends for COVID-19 cases in Australia ",
                fontFamily:
                    "Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif",
                fontSize: 20
            },
            axisX: {
                labelFontFamily: "sans-serif"
            },
            axisY: {
                labelFontFamily: "sans-serif"
            },
            legend: {
                verticalAlign: "top",
                fontFamily: "sans-serif"
            },
            toolTip: {
                shared: true
                // content:"{label}, {name}: {y}" ,
            },
            colorSet: "sitePalette",

            data: historyData
        });
        setNewOpts({
            data: newData,
            animationEnabled: true,
            height: 315,
            title: {
                text: "Daily new cases and deaths in Australia",
                fontFamily:
                    "Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif",
                fontSize: 20
            },
            axisX: {
                labelFontFamily: "sans-serif"
            },
            axisY: {
                labelFontFamily: "sans-serif"
            },
            legend: {
                verticalAlign: "top",
                fontFamily: "sans-serif"
            },
            toolTip: {
                shared: true
                // content:"{label}, {name}: {y}" ,
            },
            colorSet: "sitePalette"
        });


        setLoading(false);
    }, [countryData]);

    return loading ? (
        <div className="loading">Loading...</div>
    ) : (
        <div className="card">
            <h2>Historical Data</h2>
            <CanvasJSChart options={options} />
            <CanvasJSChart options={newOpts} />
        </div>
    );
}
