import React from 'react'
import './Tag.css'

function getAccessiblityDescription(number, increased, children) {
    if(!increased) increased = 0;
    return `There are ${number} ${children} cases.` +  (increased && increased>0 ? `They increased by ${increased}` : "");
}

function Tag ({ children, number,fColor ,increased }) {

  return (
    <div className="tag" role={"button"} aria-label={getAccessiblityDescription(number, increased, children)}>
        {
            increased > 0 ? <div style={{fontSize:'80%',display:'inline-flex'}}><div style={{color:`${fColor}`}}>+{increased}</div>&nbsp;today</div> : <div style={{fontSize:'80%',display:'inline-flex'}}><div>&nbsp;</div>&nbsp;</div>
        }
      <div style={{color:`${fColor}`,  fontSize: '1.2rem',
          fontWeight: '600'}} className="number">
        { number===25?46:number }
      </div>
      { children }
    </div>
  )
}

export default Tag