import React from "react"
import mapboxgl from 'mapbox-gl'

import 'mapbox-gl/dist/mapbox-gl.css'
import './ConfirmedMap.css'
import CovidMapControl from "./ConfirmedMap/CovidMapControl"

//Fetch Token from env
let token = process.env.REACT_APP_MAP_API;
mapboxgl.accessToken = token;


class ConfirmedMap extends React.Component {
    constructor({ stateName }) {
        super({ stateName });
        this.state = {};
        this.stateName = stateName || 'AU';

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
            <div>
                <div style={{position: 'relative'}}>
                    <CovidMapControl ref={el => this.covidMapControl = el}
                                     onGeoDataChanged={this.__onGeoDataChanged.bind(this)}>
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
                            <li style={{color: '#555', marginBottom: '2px', paddingBottom: '0px'}}><span style={{fontWeight: 'bold'}}>🔍 Zoom in</span> for regional numbers. Click regions for history over time.</li>
                            <li style={{color: '#555'}}><div style={{color: '#777', fontSize: '0.9em'}}>Regional data updated: <span ref={
                                (el) => this.__updatedSpan = el
                            }>{
                                this.__getUpdatedDates()
                            }</span></div>
                            </li>
                        </ul>
                    </span>
                </div>
            </div>
        );
    }

    /**
     *
     * @param geoDataInsts
     * @param caseDataInsts
     * @private
     */
    __onGeoDataChanged(geoDataInsts, caseDataInsts) {
        this.__geoDataInsts = geoDataInsts;
        this.__caseDataInsts = caseDataInsts;
        this.__updatedSpan.innerHTML = this.__getUpdatedDates();
    }

    __getUpdatedDates() {
        let stateUpdatedDates = (this.__caseDataInsts||[]).map((caseDataInst) => {
            return [
                caseDataInst.getRegionSchema(),
                caseDataInst.getRegionParent(),
                caseDataInst.getUpdatedDate()
            ];
        });

        return stateUpdatedDates.length ? stateUpdatedDates.map((item, index) => {
            return `<span style="margin:0; padding: 0">${item[0]}&nbsp;(${item[1]}):&nbsp;${item[2]}${index === stateUpdatedDates-1 ? '' : ';'} </span>`
        }).join('') : 'loading, please wait...'
    }

    /*******************************************************************
     * Intialization after load
     *******************************************************************/

    componentDidMount() {
        //this.explanations.parentNode.removeChild(this.explanations);
        //this.covidMapControl.addToMapContainer(this.explanations);
        this.__restrictToISO_3166_2(this.stateName);
    }

    componentWillUnmount() {
    }

    /*******************************************************************
     * Events
     *******************************************************************/

    /**
     *
     * @param iso_3166_2
     * @private
     */
    __restrictToISO_3166_2(iso_3166_2) {
        this.setState({
            iso_3166_2_tabs: iso_3166_2
        });
        iso_3166_2 = iso_3166_2 === 'all' ? null : iso_3166_2;
        this.covidMapControl.setBoundsToRegion(iso_3166_2);
    }
}

export default ConfirmedMap;
