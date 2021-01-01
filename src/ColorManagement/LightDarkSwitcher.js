import React from 'react'
import Switch from 'react-switch'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons'

import cm from "./ColorManagement";


const LightDarkSwitcher = () => {
  const isLight =
    cm.getColorSchemeType() === cm.COLOR_SCHEME_LIGHT;
  const handleThemeChange = (e) => {
    cm.setColorSchemeType(isLight ? cm.COLOR_SCHEME_DARK : cm.COLOR_SCHEME_LIGHT);
  };

  return <div style={{display: "inline-block", marginLeft: "5px"}}>
    <Switch
      className="react-switch"
      checked={!isLight}
      height={32}
      width={70}
      onColor="#666"
      offColor="#999"
      onHandleColor="#000"
      offHandleColor="#fff"
      checkedIcon={<FontAwesomeIcon icon={faSun} style={{
        marginTop: "2px",
        color: "#fff",
        width: "32px",
        verticalAlign: "baseline"
      }} />}
      uncheckedIcon={<FontAwesomeIcon icon={faMoon} style={{
        marginTop: "2px",
        color: "#000",
        width: "46px",
        verticalAlign: "baseline"
      }} />}
      onChange={handleThemeChange}
    />
  </div>;
};

export default LightDarkSwitcher;
