import React from "react";
import Tag from "./Tag";
import ReactGA from "react-ga";
import stateCaseData from "../data/stateCaseData";


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
                    <a
                        style={{
                            display: "inline-flex"
                        }}
                        onClick={
                            () => ReactGA.event({ category: 'Datasource', action: "click" })
                        }
                        className="badge badge-light"
                        target="_blank" rel="noopener noreferrer"
                        href="https://github.com/covid-19-au/covid-19-au.github.io/blob/dev/reference/reference.md"
                    >
                        <svg className="bi bi-question-circle" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm0 1A8 8 0 108 0a8 8 0 000 16z"
                                clipRule="evenodd" />
                            <path
                                d="M5.25 6.033h1.32c0-.781.458-1.384 1.36-1.384.685 0 1.313.343 1.313 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.007.463h1.307v-.355c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.326 0-2.786.647-2.754 2.533zm1.562 5.516c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z" />
                        </svg>
                        <div className="dataSource">Data Source</div>
                    </a></div>

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