import React, { Component } from 'react';
import globalConfirmed from '../data/time_series_covid19_confirmed_global.csv';
import {Line, Chart} from 'react-chartjs-2';

class LineChart extends Component {
    static defaultProps = {
        countryColours: {
            AU: {
                backgroundColor: 'rgb(0, 0, 139)',
                borderColor: 'rgba(0, 0, 139, 0.2)'
            },
            Canada: {
                backgroundColor: 'rgb(255, 0, 0)',
                borderColor: 'rgba(255, 0, 0, 0.2)'
            },
            China: {
                backgroundColor: 'rgb(170, 56, 30)',
                borderColor: 'rgba(170, 56, 30, 0.2)'
            },
            Denmark: {
                backgroundColor: 'rgb(198, 12, 48)',
                borderColor: 'rgba(198, 12, 48, 0.2)'
            },
            France: {
                backgroundColor: 'rgb(0, 85, 164)',
                borderColor: 'rgba(0, 85, 164, 0.2)'
            },
            Germany: {
                backgroundColor: 'rgb(255, 206, 0)',
                borderColor: 'rgba(255, 206, 0, 0.2)'
            },
            Iran: {
                backgroundColor: 'rgb(35, 159, 64)',
                borderColor: 'rgba(35, 159, 64, 0.2)'
            },
            Italy: {
                backgroundColor: 'rgb(0, 140, 69)',
                borderColor: 'rgba(0, 140, 69, 0.2)'
            },
            Japan: {
                backgroundColor: 'rgb(188, 0, 45)',
                borderColor: 'rgba(188, 0, 45, 0.2)'
            },
            'South Korea': {
                backgroundColor: 'rgb(0, 0, 0)',
                borderColor: 'rgba(0, 0, 0, 0.2)'
            },
            Norway: {
                backgroundColor: 'rgb(0, 48, 135)',
                borderColor: 'rgba(0, 48, 135, 0.2)'
            },
            Singapore: {
                backgroundColor: 'rgb(239, 51, 64)',
                borderColor: 'rgba(239, 51, 64, 0.2)'
            },
            Spain: {
                backgroundColor: 'rgb(237, 114, 170)',
                borderColor: 'rgba(237, 114, 170, 0.2)'
            },
            Sweden: {
                backgroundColor: 'rgb(0, 75, 135)',
                borderColor: 'rgba(0, 75, 135, 0.2)'
            },
            Switzerland: {
                backgroundColor: 'rgb(213, 43, 30)',
                borderColor: 'rgba(213, 43, 30, 0.2)'
            },
            UK: {
                backgroundColor: 'rgb(207, 20, 43)',
                borderColor: 'rgba(207, 20, 43, 0.2)'
            },
            US: {
                backgroundColor: 'rgb(60, 59, 110)',
                borderColor: 'rgba(60, 59, 110, 0.2)'
            }
        }
    }
    constructor(props) {
        super(props);
        this.chartReference = React.createRef();
        this.state = {
            xlabels: [],
            arrMap: {},
            dates: [],
            dataSets: {
                labels: [],
                datasets: []
            },
            options: {/*
                onHover: function onHover (evt, activeElements) {
                    if (!activeElements || !activeElements.length) return;
                    let graphData = this.data.datasets;
                    let datasetIndex = activeElements[0]._datasetIndex;
                    let activeDataset = graphData[datasetIndex];
                    activeDataset.borderColor = activeDataset.backgroundColor;
                    activeDataset.pointRadius = new Array(activeDataset.data.length - 1).fill(1.5);
                    console.log(this.chartReference);
                    
                    this.update();

                    function updateGraph() {
                        return this.update();
                    }

                    let updateBind = updateGraph.bind(this);
                    setInterval(function () {
                        for (let i = 0; i < graphData.length; i++) {
                            graphData[i].borderColor = props.countryColours[graphData[i].label]["borderColor"];
                            graphData[i].pointRadius = new Array(this.state.arrMap[Object.keys(this.state.arrMap)[i]]["x,y"].length - 1).fill(0);
                        }
                        updateBind();
                    }, 1000)
                },*/
                onHover: function(e, chartData) {

                    let scrollTop = window.scrollY;
                    let element = window.document.querySelectorAll('h2.chart')[0];
                    let elementOffset = element.offsetHeight + element.offsetTop + element.offsetParent.offsetTop;
                    let distance = elementOffset - scrollTop;
                    if (e && (e.clientY > (this.boxes[0].minSize.height + distance))) {
                        if (chartData.length > 0) {
                            let line = chartData[0];
                            let lineOptions = line._options;
                            let countryDataset = line._chart.config.data.datasets[line._datasetIndex];
                            lineOptions.borderColor = props.countryColours[countryDataset.label].backgroundColor;                            
                            this.update();
                        } else {
                            let lineData = this.config.data.datasets;
                            lineData.forEach(line => {
                                line.borderColor = props.countryColours[line.label].borderColor;
                            })
                            this.update();
                            return;
                        }
                    }
                },
                legend: {
                    position: "top",
                    fullWidth: false,
                    display: true,
                    labels: {
                        fontSize: 8,
                        boxWidth: 5,
                        padding: 5
                    }
                },
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        bottom: 0,
                        top: 0
                    }
                },
                animation: {
                    hover: {animationDuration: 0},
                    duration: 0,
                    onProgress: function() {
                        let chartInstance = this.chart,
                            ctx = chartInstance.ctx;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'bottom';

                        this.data.datasets.forEach(function (dataset, i) {
                            let meta = chartInstance.controller.getDatasetMeta(i);
                            if (!chartInstance.legend.legendItems[i].hidden) {
                                ctx.fillText(meta.controller._config.label, meta.data[meta.data.length - 1]._model.x, meta.data[meta.data.length - 1]._model.y - 5)
                            }
                        });
                    },
                    onComplete: function() {
                        let chartInstance = this.chart,
                            ctx = chartInstance.ctx;
                        //console.log(chartInstance.legend.legendItems);
                        ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'bottom';

                        this.data.datasets.forEach(function (dataset, i) {
                            let meta = chartInstance.controller.getDatasetMeta(i);
                            if (!chartInstance.legend.legendItems[i].hidden) {
                                ctx.fillText(meta.controller._config.label, meta.data[meta.data.length - 1]._model.x, meta.data[meta.data.length - 1]._model.y - 5)
                            }
                        });
                    }
                },
                tooltips: {
                    enabled: true,
                    intersect: false,
                    mode: 'point',
                    callbacks: {
                        label: function(tooltipItems, data) {
                            let sizeOfDataset = data.datasets[tooltipItems.datasetIndex].data.length - 1;
                            let positionHovered = sizeOfDataset - tooltipItems.index;
                            return [data.labels[(data.labels.length - 1) - positionHovered],'New Confirmed Cases (in the Past Week): ' + tooltipItems.yLabel, "Total Confirmed Cases: " + tooltipItems.xLabel];
                        },
                        title: function(tooltipItems, data) {
                            return data.datasets[tooltipItems[0].datasetIndex].label;
                        },
                        afterTitle: function(tooltipItems, data) {
                            let activeData = data.datasets[tooltipItems[0].datasetIndex];
                            activeData.borderColor = props.countryColours[activeData.label].backgroundColor;
                             
                        }
                    }
                },
                hover: {
                    mode: 'point',
                    intersect: false
                },
                scales: {
                    yAxes: [{
                        type: "logarithmic",
                        scaleLabel: {
                            display: true,
                            labelString: "New Confirmed Cases (In the Past Week)",
                            padding: {
                                left: 0,
                                right: 0,
                                bottom: 0,
                                top: 0
                            },
                            fontSize: 10
                        },
                        ticks: {
                            min: 1,
                            max: 1000000,
                            callback: function(value, index, values) {
                                if (value === 10 || value === 100 || value === 1000 || value === 10000 || value === 100000  || value === 1000000){
                                    return value;
                                }
                            },
                            fontSize: 10
                        }
                    }],
                    xAxes: [{
                        type: "logarithmic",
                        scaleLabel: {
                            display: true,
                            labelString: "Total Confirmed Cases",
                            padding: {
                                left: 0,
                                right: 0,
                                bottom: 0,
                                top: 0
                            },
                            fontSize: 10
                        },
                        ticks: {
                            min: 1,
                            max: 1000000,
                            callback: function(value, index, values) {
                                if (value === 10 || value === 100 || value === 1000 || value === 10000 || value === 100000  || value === 1000000){
                                    return value;
                                }
                            },
                            fontSize: 10
                        }
                    }]
                }
            }
        }
    }

    // merge x and y into the same object.
    mergeXY = (xVals, yVals) => {
        let mergedXY = []
        for (let i = 0; i < xVals.length; i++) {
            mergedXY.push({x: xVals[i], y: yVals[i]});
        }
        return mergedXY;
    }

    // The sum of new cases in the last week.
    calcWeeklyNewCases = (totalCases) => {
        let weeklySum = totalCases.slice(0, 7);
        for (let i = 7; i < totalCases.length; i++) {
            weeklySum.push(totalCases[i]-totalCases[i-7]);
        }
        return weeklySum;
    }

    // Calculate the difference in days between today and the inputted date.
    daysSince = (xDateLabels) => {
        // Milliseconds in 1 day.
        const one_day = 24 * 60 * 60 * 1000;
        const xlabelsFunc = [];
        xDateLabels.forEach(label => {
            const splitDates = label.split('/');
            const month = splitDates[0];
            const day = splitDates[1];
            //const year = splitDates[2];
            label = Math.round(Math.abs((new Date(2020, month - 1, day) - new Date()) / one_day));
            xlabelsFunc.push(label);
        })
        this.setState({xlabels: xlabelsFunc});
    }

    // Merge two columns of ints
    mergeColumns = (column1, column2) => {
        return column1.map(function (v, i) {return v + this[i];}, column2);
    }

    // Turn array of strings to numbers.
    parseArray = (column1) => {
        return column1.map(function (v, i) {return parseInt(v)});
    }
    
    // Filter the countries to the ones we want
    filterCountries = (country) => {
        const viableCountries = ["\"Korea", "Australia", "Italy", "Iran", "Spain", "US", "Switzerland", "France", "Germany", "United Kingdom", "Hong Kong", "Canada", "China", "Norway", "Denmark", "Sweden", "Singapore", "Japan"];
        if (viableCountries.includes(country)) {
            return true;
        }
        return false;
    }

    formatDates = (dates) => {
        return (dates.map(date => {
            const dateParts = date.split('/');
            return dateParts[1] + '/' + dateParts[0] + '/' + dateParts[2];
        }))
    }

    getData = async () => {
        // Get Response
        const response = await fetch(globalConfirmed);
        const data = await response.text();

        // Get x-axis Labels
        let dates = data.trim().split('\n').slice(0,1)[0].split(',').slice(4)
        this.setState({dates: this.formatDates(dates)});
        
        this.daysSince(dates);

        // parse table
        const table = data.trim().split('\n').slice(1);
        table.forEach(row => {
            // Filter for relevant countries
            const country = row.split(',').slice(1,2);
            if (this.filterCountries(country[0])) {

                // Parse out columns we don't want from row
                let parsedRow = row.split(',').slice(1,2).concat(row.split(',').slice(4));

                if (parsedRow[0] === "\"Korea") {
                    parsedRow = row.split(',').slice(1,2).concat(row.split(',').slice(5));
                    parsedRow[0] = "South Korea";
                }
                if (parsedRow[0] === "United Kingdom") {
                    parsedRow = row.split(',').slice(1,2).concat(row.split(',').slice(5));
                    parsedRow[0] = "UK";
                }
                if (parsedRow[0] === "Australia") {
                    parsedRow = row.split(',').slice(1,2).concat(row.split(',').slice(5));
                    parsedRow[0] = "AU";
                }
                
                // If the hashmap doesn't have the key, then insert, otherwise add the values.
                if (!this.state.arrMap[parsedRow[0]]) {
                    this.state.arrMap[parsedRow[0]] = {};
                    this.state.arrMap[parsedRow[0]]["x"] = this.parseArray(parsedRow.slice(1));
                    this.state.arrMap[parsedRow[0]]["dates"] = dates;
                } else {
                    this.state.arrMap[parsedRow[0]]["x"] = this.mergeColumns(this.parseArray(this.state.arrMap[parsedRow[0]]["x"]), this.parseArray(parsedRow.slice(1)));
                }
            }
            
        })
    }

    chartIt = async () => {
        await this.getData();
        // const ctx = document.getElementById('chart').getContext('2d');
        let arrMapKeys = Object.keys(this.state.arrMap);
        
        arrMapKeys.forEach(key => {
            let i = 0;
            for (i; i<this.state.arrMap[key]["x"].length; i++) {
                if (this.state.arrMap[key]["x"][i] > 0) {
                    break;
                }
            }
            this.state.arrMap[key]["dates"] = this.state.arrMap[key]["dates"].slice(i);
            this.state.arrMap[key]["x"] = this.state.arrMap[key]["x"].slice(i);
            this.state.arrMap[key]["y"] = this.calcWeeklyNewCases(this.state.arrMap[key]["x"]);
            this.state.arrMap[key]["x,y"] = this.mergeXY(this.state.arrMap[key]["x"], this.state.arrMap[key]["y"]);
        })

        
        const dataSets = [];
        for (let i = 0; i < arrMapKeys.length; i++) {
            let newDataSet = {};
            newDataSet["label"] = arrMapKeys[i];
            newDataSet["fill"] = false;
            newDataSet["backgroundColor"] = this.props.countryColours[arrMapKeys[i]]["backgroundColor"];
            newDataSet["borderColor"] = this.props.countryColours[arrMapKeys[i]]["borderColor"];
            newDataSet["borderWidth"] = 1.5;
            newDataSet["data"] = this.state.arrMap[arrMapKeys[i]]["x,y"];
            let pointRadiusSizes = new Array(this.state.arrMap[arrMapKeys[i]]["x,y"].length - 1).fill(0);
            newDataSet["pointRadius"] = pointRadiusSizes;
            newDataSet["hoverRadius"] = new Array(this.state.arrMap[arrMapKeys[i]]["x,y"].length - 1).fill(4);

            dataSets.push(newDataSet);
        }
        this.setState({dataSets: {labels: this.state.dates, datasets: dataSets}});

    }

    componentDidMount() {
        this.chartIt();
    }

    render() {
        return(
            <div className="card" style={{height: `${window.innerHeight < 850 ? "100vh" : "90vh"}`}}>
                <div style={{height: "80vh"}}>
                    <h2 className="chart">Global Cases Graph on Log Scale</h2>
                    <Line
                        ref={this.chartReference}
                        data={this.state.dataSets}
                        options={this.state.options}
                    />
                </div>
            </div>
        )
    }
}

export default LineChart;