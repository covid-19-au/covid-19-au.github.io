import uuid from "react-uuid";
import React, { useState } from "react";
import stateData from "../data/state";
import AgeGenderChart from "../DataVis/AgeGenderChart";

import { Modal, Button } from "react-bootstrap";

export default function Area({ area, onChange, data }) {
  const [showAgeGenderChart, setShowAgeGenderChart] = useState(false);
  const [modalState, setModalState] = useState("NSW");

  let totalRecovered = 0;
  for (let i = 0; i < data.length; i++) {
    totalRecovered += parseInt(data[i][3]);
  }
  let lastTotal =
    stateData[Object.keys(stateData)[Object.keys(stateData).length - 1]];

  const getAriaLabel = (state, confirmed, death, recovered, tested) => {
    return `In ${state
      .split("")
      .join(
        " "
      )}, there were ${confirmed} confirmed cases. Out of them, ${death} unfortunately resulted in death.

    ${recovered} recovered and ${tested} were tested`;
  };

  const openModal = state => {
    setModalState(state);
    setShowAgeGenderChart(true);
  };

  const renderArea = () => {
    // let latest =
    //     testedCases[
    //         Object.keys(testedCases)[Object.keys(testedCases).length - 1]
    //         ];

    return data.map(x => (
      <div
        role={"button"}
        aria-label={getAriaLabel(...x)}
        aria-describedby={getAriaLabel(...x)}
        className="province"
        key={uuid()}
      >
        {/*<div className={`area ${x.name ? 'active' : ''}`}>*/}
        {/*{ x.name || x.cityName }*/}
        {/*</div>*/}
        {/*<div className="confirmed">{ x.confirmedCount }</div>*/}
        {/*<div className="death">{ x.deadCount }</div>*/}
        {/*<div className="cured">{ x.curedCount }</div>*/}
        <div className={"area"}>
          <strong>
            <a href="javascript:void(0)" onClick={() => openModal(x[0])}>
              {x[0]}
            </a>
          </strong>
          <Modal
            show={showAgeGenderChart}
            onHide={() => setShowAgeGenderChart(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title>{modalState} Chart</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <AgeGenderChart state={modalState} />
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowAgeGenderChart(false)}
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
        <div className="confirmed">
          <strong>{numberWithCommas(x[1])}</strong>&nbsp;
          <div className="dailyIncrease">
            {x[1] - lastTotal[x[0]][0] > 0
              ? `(+${x[1] - lastTotal[x[0]][0]})`
              : null}
          </div>
        </div>
        <div className="death">
          <strong>{numberWithCommas(x[2])}</strong>&nbsp;
          <div className="dailyIncrease">
            {x[2] - lastTotal[x[0]][1] > 0
              ? ` (+${x[2] - lastTotal[x[0]][1]})`
              : null}
          </div>
        </div>
        <div className="cured">
          <strong>{numberWithCommas(x[3])}</strong>&nbsp;
          <div className="dailyIncrease">
            {x[3] - lastTotal[x[0]][2] > 0
              ? `(+${x[3] - lastTotal[x[0]][2]})`
              : null}
          </div>
        </div>
        <div className="tested">{numberWithCommas(x[4])}</div>
      </div>
    ));
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
