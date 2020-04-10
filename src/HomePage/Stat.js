import React, { useState, Suspense, useEffect } from "react";
import Tag from "./Tag";
import ReactGA from "react-ga";
import stateCaseData from "../data/stateCaseData";
import Acknowledgement from "../Acknowledgment";
import todayData from "../data/stateCaseData.json";
import previousData from "../data/state.json";
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';


function UpdatesToday() {

    const [update, setUpdate] = useState("Cases");


    const updateStates = ["Cases", "Deaths", "Recoveries", "Tested"]

    let currentView

    if (update == "Cases") {
        currentView = 0
    }

    if (update == "Deaths") {
        currentView = 1
    }

    if (update == "Recoveries") {
        currentView = 2
    }

    if (update == "Tested") {
        currentView = 3
    }

    let today = new Date()
    let yesterday = new Date(today)

    yesterday.setDate(yesterday.getDate() - 1)

    let yesterdayKey = yesterday.getFullYear().toString() + "-" + parseInt(yesterday.getMonth() + 1).toString() + "-" + yesterday.getDate().toString()

    let yesterdayData = previousData[yesterdayKey]

    let stateUpdateStatus = {}
    for (let state in yesterdayData) {
        stateUpdateStatus[state] = [false, false, false, false]
    }
    console.log(stateUpdateStatus)

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
            stateUpdateStatus[state][0] = true
        }
        if (todayDataObject[state][1] != yesterdayData[state][1]) {
            stateUpdateStatus[state][1] = true
        }
        if (todayDataObject[state][2] != yesterdayData[state][2]) {
            stateUpdateStatus[state][2] = true
        }
        if (todayDataObject[state][3] != yesterdayData[state][3]) {
            stateUpdateStatus[state][3] = true
        }
    }


    const switchStyles = [
        {
            //Cases
            color: 'black',
            borderColor: '#ff603c',
            padding: "1px",
            zIndex: 10,
            outline: "none",
            paddingLeft: "5px",
            paddingRight: "5px",
            fontSize: "80%",
            marginBottom: "1rem"
        },
        {
            //Deaths
            color: 'black',
            borderColor: '#c11700',
            padding: "1px",
            zIndex: 10,
            outline: "none",
            paddingLeft: "5px",
            paddingRight: "5px",
            fontSize: "80%",
            marginBottom: "1rem"
        },
        {
            //Recoveries
            color: 'black',
            borderColor: '#00c177',
            padding: "1px",
            zIndex: 10,
            outline: "none",
            paddingLeft: "5px",
            paddingRight: "5px",
            fontSize: "80%",
            marginBottom: "1rem"
        },
        {
            //Tested
            color: 'black',
            borderColor: '#007cf2',
            padding: "1px",
            zIndex: 10,
            outline: "none",
            paddingLeft: "5px",
            paddingRight: "5px",
            fontSize: "80%",
            marginBottom: "1rem"
        }]


    const dataStyles = [{
        color: '#ff603c',
        borderColor: 'black',
        padding: "0px",
        border: "none",
        zIndex: 10,
        backgroundColor: "#f2f4f4",
        fontWeight: "bold"
    }, {
        color: '#c11700',
        borderColor: 'black',
        padding: "0px",
        border: "none",
        zIndex: 10,
        backgroundColor: "#f2f4f4",
        fontWeight: "bold"
    }, {
        color: '#00c177',
        borderColor: 'black',
        padding: "0px",
        border: "none",
        zIndex: 10,
        backgroundColor: "#f2f4f4",
        fontWeight: "bold"
    }, {
        color: '#007cf2',
        borderColor: 'black',
        padding: "0px",
        border: "none",
        zIndex: 10,
        backgroundColor: "#f2f4f4",
        fontWeight: "bold"
    }]
    const inactiveStyles = {
        color: '#ccd1d1',
        borderColor: 'grey',
        padding: "0px",
        border: "none",
        backgroundColor: "#f2f4f4"
    };


    const inactiveStylesSwitch = {
        color: 'grey',
        borderColor: '#fce7e6',
        padding: "1px",
        outline: "none",
        paddingLeft: "5px",
        paddingRight: "5px",
        fontSize: "80%",
        marginBottom: "1rem"
    };




    return (
        <div style={{
            marginTop: '1rem',
            marginBottom: '1rem'
        }}>
            Daily Update Status: &nbsp;

            <ButtonGroup color="primary" aria-label="outlined primary button group">

                {updateStates.map((updateType, index) => (
                    <Button
                        style={updateType == update ? switchStyles[index] : inactiveStylesSwitch}
                        onClick={() => setUpdate(updateType)} size="small">{updateType}</Button>
                ))}
            </ButtonGroup>

            <ButtonGroup color="primary" aria-label="outlined primary button group" fullWidth="true" >

                {Object.keys(stateUpdateStatus).map((state, status) => (
                    <Button
                        href={("./state/" + state).toLowerCase()}
                        style={stateUpdateStatus[state][currentView] ? dataStyles[currentView] : inactiveStyles}>{state}</Button>

                ))}
            </ButtonGroup>

            {/*<p style={{ marginBottom: "5px", marginTop: "10px" }}>New Deaths:</p>
            <ButtonGroup color="primary" aria-label="outlined primary button group" style={{ buttonGroupStyles }} fullWidth="true" >

                {Object.keys(stateUpdateStatus).map((state, status) => (
                    <Button
                        href={("./state/" + state).toLowerCase()}
                        style={stateUpdateStatus[state][1] ? deathActiveStyles : inactiveStyles}>{state}</Button>

                ))}
            </ButtonGroup>

            <p style={{ marginBottom: "5px", marginTop: "10px" }}>New Recoveries:</p>
            <ButtonGroup color="primary" aria-label="outlined primary button group" style={{ buttonGroupStyles }} fullWidth="true" >

                {Object.keys(stateUpdateStatus).map((state, status) => (
                    <Button
                        href={("./state/" + state).toLowerCase()}
                        style={stateUpdateStatus[state][2] ? recoveredActiveStyles : inactiveStyles}>{state}</Button>

                ))}
            </ButtonGroup>

            <p style={{ marginBottom: "5px", marginTop: "10px" }}>New Tested:</p>
            <ButtonGroup color="primary" aria-label="outlined primary button group" style={{ buttonGroupStyles }} fullWidth="true" >

                {Object.keys(stateUpdateStatus).map((state, status) => (
                    <Button
                        href={("./state/" + state).toLowerCase()}
                        style={stateUpdateStatus[state][3] ? testedActiveStyles : inactiveStyles}>{state}</Button>

                ))}
                </ButtonGroup>*/}
        </div>
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
            <div className="row">
                <Tag
                    number={2150}
                    fColor={"#00aac1"}
                    increased={50}
                    typeOfCases={"Active Cases"}
                >
                    <button className="hoverButton" data-toggle="tooltip" data-placement="bottom" data-html="true"
                        title="<em>Number of people that have been tested for COVID-19.</em>">
                        Active Cases</button>

                </Tag>
                <Tag
                    number={159}
                    fColor={"#c100aa"}
                    increased={2}
                    typeOfCases={"In ICU"}
                >
                    <button className="hoverButton" data-toggle="tooltip" data-placement="bottom" data-html="true"
                        title="<em>Number of people that have been tested for COVID-19.</em>">
                        In ICU</button>

                </Tag></div>

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