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
        style={{
          "background-color": "#bae1ff",
          filter: "saturate(65%)",
          border: "2px solid white",
          height: "30px",
        }}
      >
        <th
          style={{
            "font-weight": "bold",
            "text-decoration": "underline",
            width: "148px",
          }}
        >
          {isExpanded} {item.name}
        </th>
        <td
          colspan="3"
          style={{
            "text-align": "right",
            color: "grey",
            backgroundColor: "#f8f8f8",
          }}
        >
          {item.status}
        </td>
      </tr>,
    ];

    if (this.state.expandedRows.includes(item.name)) {
      itemRows.push(
        item.data.map((row) => (
          <tr key={"row-expanded-" + item.name}>
            <td stype={{ border: "2px solid white" }}>{row.lastUpdate}</td>
            <td stype={{ border: "2px solid white" }}>{row.state}</td>
            <td stype={{ border: "2px solid white" }}>{row.case} cases</td>
            <td stype={{ border: "2px solid white" }}>{row.death} deaths</td>
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
        <table style={{ "font-size": "80%" }}>{allItemRows}</table>
      </div>
    );
  }
}
