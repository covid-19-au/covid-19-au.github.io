import uuid from "react-uuid";
import React from "react";
import stateData from "../data/state";
import testedCases from "../data/testedCases";

const CONFIRMED = 1;
const DEATH = 2;
const CURED = 3;
const TESTED = 4;

export default function Area({ area, onChange, data }) {
    let totalRecovered = 0;
    for (let i = 0; i < data.length; i++) {
        totalRecovered += parseInt(data[i][3]);
    }
    let lastTotal =
        stateData[
            Object.keys(stateData)[Object.keys(stateData).length - 1]
            ];

    const getAriaLabel = (state, confirmed, death, recovered, tested) => {
        return `In ${state.split("").join(" ")}, there were ${confirmed} confirmed cases. Out of them, ${death} unfortunately resulted in death.

    ${recovered} recovered and ${tested} were tested`;
    };

    const renderArea = () => {
        let latest =
            testedCases[
                Object.keys(testedCases)[Object.keys(testedCases).length - 1]
                ];

        return data.map(x => (
            <div role={"button"} aria-label={getAriaLabel(...x)} aria-describedby={getAriaLabel(...x)} className="province" key={uuid()}>
                {/*<div className={`area ${x.name ? 'active' : ''}`}>*/}
                {/*{ x.name || x.cityName }*/}
                {/*</div>*/}
                {/*<div className="confirmed">{ x.confirmedCount }</div>*/}
                {/*<div className="death">{ x.deadCount }</div>*/}
                {/*<div className="cured">{ x.curedCount }</div>*/}
                <div className={"area"}>
                    <strong>{x[0]}</strong>
                </div>
                <div className="confirmed">
                    <strong>{numberWithCommas(x[CONFIRMED])}</strong>&nbsp;<div className="dailyIncrease">{(x[CONFIRMED] - lastTotal[x[0]][0]) > 0 ? `(+${x[1] - lastTotal[x[0]][0]})` : null}</div>
                </div>
                <div className="death">
                    <strong>{numberWithCommas(x[DEATH])}</strong>&nbsp;<div className="dailyIncrease">{(x[DEATH] - lastTotal[x[0]][1]) > 0 ? ` (+${x[2] - lastTotal[x[0]][1]})` : null}</div>
                </div>
                <div className="cured">
                    <strong>{numberWithCommas(x[CURED])}</strong>&nbsp;<div className="dailyIncrease">{(x[CURED] - lastTotal[x[0]][2]) > 0 ? `(+${x[3] - lastTotal[x[0]][2]})` : null}</div>
                </div>
                <div className="tested">{numberWithCommas(x[TESTED])}</div>
            </div>
        ));
    };

    const Total = ({data}) => {
        const sumRow = (index, data) => data.reduce((total, row) => {
            const val = +row[index] || 0;
            return total + val;
        }, 0);

        return (
            <div className="province table-footer">
                <div className="area">Total</div>
                <div className="confirmed">{numberWithCommas(sumRow(CONFIRMED, data))}</div>
                <div className="death">{numberWithCommas(sumRow(DEATH, data))}</div>
                <div className="cured">{numberWithCommas(sumRow(CURED, data))}</div>
                <div className="tested">{numberWithCommas(sumRow(TESTED, data))}</div>
            </div>
        )
    };

    return (
        <div role={"table"}>
            <div className="province header">
                <div className="area header statetitle">State</div>
                <div className="confirmed header confirmedtitle">Confirmed</div>
                <div className="death header deathtitle">Deaths</div>
                <div className="cured header recoveredtitle">Recovered</div>
                <div className="tested header testedtitle">Tested</div>
            </div>
            {renderArea()}
            <Total data={data} />

            {totalRecovered > 25 ? null : (
                <div className="province">
                    <div className={"area"}>
                        <strong>TBD</strong>
                    </div>
                    <div className="confirmed">
                        <strong></strong>
                    </div>
                    <div className="death">
                        <strong></strong>
                    </div>
                    <div className="cured">
                        <strong>21</strong>
                    </div>
                    <div className="tested"></div>
                </div>
            )}
        </div>
    );
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
