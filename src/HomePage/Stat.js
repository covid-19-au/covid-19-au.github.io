import React from "react";
import Tag from "./Tag";
import ReactGA from "react-ga";
import stateCaseData from "../data/stateCaseData";
import Acknowledgement from "../Acknowledgment"


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
        curedCountIncrease = curedCount - lastTotal[1];
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
                >
                    <button className="hoverButton" data-toggle="tooltip" data-placement="bottom" data-html="true"
                        title="<em>All confirmed deaths due to COVID-19, including 1 from the Diamond Princess cruise ship.</em>">
                        Deaths</button>

                </Tag>
            </div>
            <div className="row">
                <Tag
                    number={curedCount}
                    fColor={"#00c177"}
                    increased={curedCountIncrease}
                >
                    <button className="hoverButton" data-toggle="tooltip" data-placement="bottom" data-html="true"
                        title="<em>Number of people that have recovered from COVID-19.</em>">
                        Recovered</button>

                </Tag>
                <Tag
                    number={testedCount}
                    fColor={"#007cf2"}
                    increased={testedCountIncrease}
                >
                    <button className="hoverButton" data-toggle="tooltip" data-placement="bottom" data-html="true"
                        title="<em>Number of people that have been tested for COVID-19.</em>">
                        Tested</button>

                </Tag>

            </div>

            <span className="due" style={{ fontSize: "80%", paddingTop: 0 }}>
                Time in AEDT, last updated at: {stateCaseData.updatedTime}
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