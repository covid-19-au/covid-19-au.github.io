import React from "react";

export default function Header({ province }) {
  return (
    <header>
      <div className="bg"></div>
      <h1
        style={{
          fontSize: "120%"
        }}
      >
        COVID-19 in Australia — Real-Time Report
      </h1>
      {/*<i>By Students from Monash</i>*/}
    </header>
  );
}
