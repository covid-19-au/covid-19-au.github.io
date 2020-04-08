import React from "react";
import Tag from "./Tag";
import ReactGA from "react-ga";
import stateCaseData from "../data/stateCaseData";
import Acknowledgement from "../Acknowledgment";
import todayData from "../data/stateCaseData.json";
import previousData from "../data/state.json";
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';

function UpdatesToday() {

    let today = new Date()
    let yesterday = new Date(today)

    yesterday.setDate(yesterday.getDate() - 1)

    let yesterdayKey = yesterday.getFullYear().toString() + "-" + parseInt(yesterday.getMonth() + 1).toString() + "-" + yesterday.getDate().toString()

    let yesterdayData = previousData[yesterdayKey]


    let stateUpdateStatus = {}
    for (let state in yesterdayData) {
        stateUpdateStatus[state] = false
    }

    let todayDataObject = {}

    let values = todayData["values"]

    let i = 0
    while (i < values.length) {

        let currentState = values[i][0]
        todayDataObject[currentState] = []
        todayDataObject[currentState].push(values[i][1])
        todayDataObject[currentState].push(values[i][2])
        todayDataObject[currentState].push(values[i][3])
        todayDataObject[currentState].push(values[i][4])

        i = i + 1
    }

    for (let state in stateUpdateStatus) {
        if (todayDataObject[state][0] != yesterdayData[state][0]) {
            stateUpdateStatus[state] = true
        }
    }

    console.log(todayDataObject)
    console.log(yesterdayData)
    console.log(stateUpdateStatus)



    const activeStyles = {
        color: 'black',
        borderColor: '#8ccfff',
        padding: "0px",
        outline: "none",
        zIndex: 10
    };
    const inactiveStyles = {
        color: 'grey',
        borderColor: '#e3f3ff',
        padding: "0px",
        outline: "none"
    };

    return (

        <ButtonGroup size="normal" aria-label="small outlined button group">
            <Button style={inactiveStyles} disableElevation={true}>On</Button>
            <Button style={activeStyles}>Off</Button>
        </ButtonGroup>
    )

}

export default function Stat({
    modifyTime,
    confirmedCount,
    suspectedCount,
    deadCount,
    curedCount,
    testedCount,
    name,
    quanguoTrendChart,
    hbFeiHbTrendChart,
    data,
    countryData
}) {
    let confCountIncrease = 0;
    let deadCountIncrease = 0;
    let curedCountIncrease = 0;
    let testedCountIncrease = 0;
    if (data && countryData) {
        confirmedCount = 0;
        testedCount = 0;
        deadCount = 0;
        curedCount = 0;
        for (let i = 0; i < data.length; i++) {
            confirmedCount += parseInt(data[i][1]);
            deadCount += parseInt(data[i][2]);
            curedCount += parseInt(data[i][3]);

            if (data[i][4] == "N/A") {
                //do nothing
            }
            else {
                testedCount += parseInt(data[i][4]);
            }

        }
        let lastTotal =
            countryData[
            Object.keys(countryData)[Object.keys(countryData).length - 1]
            ];
        confCountIncrease = confirmedCount - lastTotal[0];
        deadCountIncrease = deadCount - lastTotal[2];
        // curedCountIncrease = curedCount - lastTotal[1];
        testedCountIncrease = testedCount - lastTotal[4]
    } else {
        confirmedCount = 0;
        deadCount = 0;
        curedCount = 0;
        testedCount = 0;
    }

    return (
        <div className="card">

            <h2 style={{ display: "flex" }}>Status {name ? `· ${name}` : false}
                <div style={{ alignSelf: "flex-end", marginLeft: "auto", fontSize: "60%" }}>
                    <Acknowledgement>
                    </Acknowledgement></div>

            </h2>



            <div className="row">

                <Tag
                    number={confirmedCount}
                    fColor={"#ff603c"}
                    increased={confCountIncrease}
                    typeOfCases={"Confirmed"}
                >
                    <button className="hoverButton" data-toggle="tooltip" data-placement="bottom" data-html="true"
                        title="<em>All confirmed cases of COVID-19 so far, including deaths and recoveries.</em>">
                        Confirmed</button>

                </Tag>
                {/*<Tag number={suspectedCount || '-'}>*/}
                {/*疑似*/}
                {/*</Tag>*/}
                <Tag
                    number={deadCount}
                    fColor={"#c11700"}
                    increased={deadCountIncrease}
                    typeOfCases={"Deaths"}
                >
                    <button className="hoverButton" data-toggle="tooltip" data-placement="bottom" data-html="true"
                        title="<em>All confirmed deaths due to COVID-19, including 1 from the Diamond Princess cruise ship.</em>">
                        Deaths</button>

                </Tag>
            </div>
            <div className="row">
                <Tag
                    // number={curedCount}
                    number={"2500+"}
                    fColor={"#00c177"}
                    increased={curedCountIncrease}
                    typeOfCases={"Recovered"}
                >
                    <button className="hoverButton" data-toggle="tooltip" data-placement="bottom" data-html="true"
                        title="<em>Number of people that have recovered from COVID-19.</em>">
                        Recovered</button>

                </Tag>
                <Tag
                    number={testedCount}
                    fColor={"#007cf2"}
                    increased={testedCountIncrease}
                    typeOfCases={"Tested"}
                >
                    <button className="hoverButton" data-toggle="tooltip" data-placement="bottom" data-html="true"
                        title="<em>Number of people that have been tested for COVID-19.</em>">
                        Tested</button>

                </Tag>

            </div>
            <UpdatesToday></UpdatesToday>

            <span className="due" style={{ fontSize: "80%", paddingTop: 0 }}>
                Time in AEST, last updated at: {stateCaseData.updatedTime}
            </span>

            {/*<div>*/}
            {/*<img width="100%" src={quanguoTrendChart[0].imgUrl} alt="" />*/}
            {/*</div>*/}
            {/*<div>*/}
            {/*<img width="100%" src={hbFeiHbTrendChart[0].imgUrl} alt="" />*/}
            {/*</div>*/}
        </div>

    );
}