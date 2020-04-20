import React from "react";
import { Component } from "react";
import Acknowledgement from "../Acknowledgment";
import ships from "../data/ship.json";

export default class Ships extends Component {
  constructor() {
    super();
    this.state = {
      data: ships,
      expandedRows: [],
    };
  }

  handleRowClick(rowId) {
    const currentExpandedRows = this.state.expandedRows;
    const isRowCurrentlyExpanded = currentExpandedRows.includes(rowId);

    const newExpandedRows = isRowCurrentlyExpanded
      ? currentExpandedRows.filter((id) => id !== rowId)
      : currentExpandedRows.concat(rowId);

    this.setState({ expandedRows: newExpandedRows });
  }

  renderItem(item) {
    const clickCallback = () => {
      this.handleRowClick(item.name);
    };

    const isExpanded = this.state.expandedRows.includes(item.name) ? "-" : "+";

    const itemRows = [
      <tr
        onClick={clickCallback}
        key={"row-data-" + item.name}
        class="shiptitletr"
      >
        <td colspan="2" class="shiptitlename">
          {isExpanded} {item.name}
        </td>
        <td colspan="2" class="shiptitlestatus">
          {item.status}
        </td>
      </tr>,
    ];

    if (this.state.expandedRows.includes(item.name)) {
      itemRows.push(
        <tr key={"row-expanded-" + item.name} class="shipexpandtr">
          <td class="shipexpandttitle">Last Update</td>
          <td class="shipexpandttitle">State</td>
          <td class="shipexpandttitle">Cases</td>
          <td class="shipexpandttitle">Death</td>
        </tr>,
        item.data.map((row) => (
          <tr class="shipexpandtds">
            <td>{row.lastUpdate}</td>
            <td>{row.state}</td>
            <td>{row.case}</td>
            <td>{row.death}</td>
          </tr>
        ))
      );
    }

    return itemRows;
  }

  render() {
    let allItemRows = [];

    this.state.data.forEach((item) => {
      const perItemRows = this.renderItem(item);
      allItemRows = allItemRows.concat(perItemRows);
    });

    return (
      <div className="card">
        <h2
          style={{ display: "flex" }}
          aria-label="Ships with reported COVID 19 cases"
        >
          Cruise Ships
          <div
            style={{
              alignSelf: "flex-end",
              marginLeft: "auto",
              fontSize: "60%",
            }}
          >
            <Acknowledgement></Acknowledgement>
          </div>
        </h2>
        <table class="shiptable">{allItemRows}</table>
        <p class="key due">* Ships that link to Australia COVID19 cases.</p>
      </div>
    );
  }
}
