import React from "react"
import mapboxgl from 'mapbox-gl'

import 'mapbox-gl/dist/mapbox-gl.css'
import './ConfirmedMap.css'
import Acknowledgement from "../Acknowledgment"
import CovidMapControl from "./ConfirmedMap/CovidMapControl"

//Fetch Token from env
let token = process.env.REACT_APP_MAP_API;
mapboxgl.accessToken = token;


class ConfirmedMap extends React.Component {
    constructor(props) {
        super(props);

        this.stateUpdatedDates = []; // FIXME!!!
        this.accuracyWarning = React.createRef();
    }

    /*******************************************************************
     * HTML Template
     *******************************************************************/

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    render() {
        return (
            <div className="card" style={{
                display: 'flex',
                flexDirection: 'column'
            }}>
                <h2 style={{ display: "flex" }}
                    aria-label="Casemap">World Casemap<div style={{
                        alignSelf: "flex-end",
                        marginLeft: "auto",
                        fontSize: "60%"
                    }}>
                        <Acknowledgement>
                        </Acknowledgement>
                        </div></h2>

                <div style={{position: 'relative'}}>
                    <CovidMapControl ref={el => this.covidMapControl = el} >
                    </CovidMapControl>
                </div>

                <div ref={el => this.explanations = el} style={{
                    width: "100%",
                    pointerEvents: "none",
                    marginTop: '-20px',
                    zIndex: 5000,
                    background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%,rgba(255,255,255,0.9) 15%)"
                }}>
                    <span className="due">
                        <ul ref={this.accuracyWarning} style={{margin: '0px', padding: '5px 20px'}}>
                            <li style={{color: '#555', marginBottom: '2px', paddingBottom: '0px'}}>Regional Case Map may not be up-to-date. Refer to state totals in Cases by State table for current statistics.</li>
                            <li style={{color: '#555', marginBottom: '2px', paddingBottom: '0px'}}>Displayed cases identify regions only, not specific addresses.</li>
                            <li style={{color: '#555', marginBottom: '2px', paddingBottom: '0px'}}>Zoom in for regional numbers. Click regions for history over time.</li>
                            <li style={{color: '#555'}}><div style={{color: '#777', fontSize: '0.9em'}}>Regional data updated: {
                                this.stateUpdatedDates.length ? this.stateUpdatedDates.map((item, index) => {
                                    return <span style={{margin:0, padding: 0}}>{item[0]}&nbsp;({item[1]}):&nbsp;{item[2]}{index === this.stateUpdatedDates.length-1 ? '' : ';'} </span>
                                }) : 'loading, please wait...'
                            }</div>
                            </li>
                        </ul>
                    </span>
                </div>
            </div>
        );
    }

    /*******************************************************************
     * Intialization after load
     *******************************************************************/

    componentDidMount() {
        //this.explanations.parentNode.removeChild(this.explanations);
        //this.covidMapControl.addToMapContainer(this.explanations);
    }

    componentWillUnmount() {
    }
}

export default ConfirmedMap;

