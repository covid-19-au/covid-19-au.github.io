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
            marginTop: "0.5rem",
            textTransform: "none"
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
            marginTop: "0.5rem",
            textTransform: "none"
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
            marginTop: "0.5rem",
            textTransform: "none"
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
            marginTop: "0.5rem",
            textTransform: "none"
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
        borderColor: '#e3e3e3',
        padding: "1px",
        outline: "none",
        paddingLeft: "5px",
        paddingRight: "5px",
        fontSize: "80%",
        marginTop: "0.5rem",
        textTransform: "none",
        fontWeight: "normal"
    }




    return (
        <div style={{
            marginTop: '1rem',
            marginBottom: '1rem'
        }}>
            Daily Update Status <svg className="bi bi-question-circle" width="0.7em" height="0.7em" viewBox="0 0 16 16" fill="currentColor"
                xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm0 1A8 8 0 108 0a8 8 0 000 16z"
                    clipRule="evenodd" />
                <path
                    d="M5.25 6.033h1.32c0-.781.458-1.384 1.36-1.384.685 0 1.313.343 1.313 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.007.463h1.307v-.355c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.326 0-2.786.647-2.754 2.533zm1.562 5.516c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z" />
            </svg> : &nbsp;

            <ButtonGroup color="primary" aria-label="outlined primary button group">

                {updateStates.map((updateType, index) => (
                    <Button
                        style={updateType == update ? switchStyles[index] : inactiveStylesSwitch}
                        onClick={() => setUpdate(updateType)} size="small">{updateType}</Button>
                ))}
            </ButtonGroup>

            <ButtonGroup color="primary" aria-label="outlined primary button group" fullWidth="true" style={{ marginTop: "0.5rem" }} >

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
    countryData,
    hospitalCount,
    icuCount
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
        hospitalCount = 0;
        icuCount = 0;
        for (let i = 0; i < data.length; i++) {
            confirmedCount += parseInt(data[i][1]);
            deadCount += parseInt(data[i][2]);
            curedCount += parseInt(data[i][3]);
            console.log(data[i])
            hospitalCount += parseInt(data[i][5]);
            icuCount += parseInt(data[i][6]);


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
        hospitalCount = 0;
        icuCount = 0;
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
                    number={hospitalCount}
                    fColor={"#00aac1"}
                    increased={0}
                    typeOfCases={"In Hospital"}
                >
                    <button className="hoverButton" data-toggle="tooltip" data-placement="bottom" data-html="true"
                        title="<em>Number of people in hospital with COVID-19.</em>">
                        in Hospital</button>

                </Tag>
                <Tag
                    number={icuCount}
                    fColor={"#c100aa"}
                    increased={0}
                    typeOfCases={"In ICU"}
                >
                    <button className="hoverButton" data-toggle="tooltip" data-placement="bottom" data-html="true"
                        title="<em>Number of people with COVID-19 in intensive care.</em>">
                        in ICU</button>

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