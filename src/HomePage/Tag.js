import React from 'react'
import './Tag.css'

function getAccessiblityDescription(number, increased, typeOfCases) {
  if (!increased) increased = 0;
  if (typeOfCases.toLowerCase().indexOf("test") !== -1)
    return `There are ${number} people who were ${typeOfCases}.` + (increased && increased > 0 ? `They increased by ${increased}` : "");
  else
    return `There are ${number} ${typeOfCases} cases.` + (increased && increased > 0 ? `They increased by ${increased}` : "");
}

function Tag({ children, number, fColor, increased, typeOfCases }) {

  return (
    <div className="tag" role={"button"} aria-label={getAccessiblityDescription(number, increased, typeOfCases)}>
      {
        increased > 0 ? <div style={{ fontSize: '80%', display: 'inline-flex' }}><div className="increase" style={{ color: `${fColor}` }}>+{increased}</div>&nbsp;<div className="increase" >today</div></div> : <div style={{ fontSize: '80%', display: 'inline-flex' }}><div>&nbsp;</div>&nbsp;</div>
      }
      {
        increased < 0 ? <div style={{ fontSize: '80%', display: 'inline-flex' }}><div className="increase" style={{ color: `${fColor}` }}>{increased}</div>&nbsp;<div className="increase" >today</div></div> : <div style={{ fontSize: '80%', display: 'inline-flex' }}><div>&nbsp;</div>&nbsp;</div>
      }
      <div style={{
        color: `${fColor}`
      }} className="number">
        {number}
      </div>
      {children}
    </div>
  )
}

export default Tag