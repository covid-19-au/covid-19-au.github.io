import React from 'react'
import './Tag.css'
import cm from "../color_management/ColorManagement";


function getAccessiblityDescription(number, increased, typeOfCases) {
  if (!increased) {
    increased = 0;
  }
  if (typeOfCases.toLowerCase().indexOf("test") !== -1) {
    return `There are ${number} people who were ${typeOfCases}.` +
        (increased && increased > 0 ? `They increased by ${increased}` : "");
  } else {
    return `There are ${number} ${typeOfCases} cases.` +
        (increased && increased > 0 ? `They increased by ${increased}` : "");
  }
}

function Tag({ children, number, fColor, increased, typeOfCases }) {
  let increasedDecreased = '';
  let idStyles = {
    fontSize: '1em',
    display: 'inline-flex'
  };

  if (increased > 0) {
    increasedDecreased = <>
      <div style={idStyles}>
        <div className="increase" style={{ color: `${fColor}` }}>+{increased}</div>&nbsp;
        <div className="increase" >today</div>
      </div>
    </>;
  } else if (increased < 0) {
    increasedDecreased = <>
      <div style={idStyles}>
        <div className="increase" style={{ color: `${fColor}` }}>{increased}</div>&nbsp;
        <div className="increase" >today</div>
      </div>
    </>;
  } else {
    increasedDecreased = <>
      <div style={idStyles}>
          <div>&nbsp;</div>&nbsp;
      </div>
    </>
  }

  return (
    <div className="tag"
         role={"button"}
         aria-label={getAccessiblityDescription(number, increased, typeOfCases)}>
        {children}
      <div style={{
        background: cm.getBackgroundColor(),
        borderRadius: '2px',
        padding: '10px 0px 3px 0px',
      }}>
        <div style={{
          color: `${fColor}`
        }} className="number">
          {number}
        </div>
        {increasedDecreased}
      </div>
    </div>
  )
}
export default Tag;
