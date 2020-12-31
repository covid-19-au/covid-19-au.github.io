/**
This file is licensed under the MIT license

Copyright (c) 2020 David Morrissey

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

import Grid from "@material-ui/core/Grid";
import React from "react";
import WorldMap from "./HomePage/WorldMap";
import {faInfoCircle, faExclamationCircle} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import SocialMediaShareModal from "./socialMediaShare/SocialMediaShareModal";
import ReactGA from "react-ga";

class WorldPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        // spacing={gspace}
        return (
            <>
            <div className="alert alert-info" role="alert" style={{width: "100vw", margin: 0}}>
                <FontAwesomeIcon icon={faInfoCircle} /> As far as we know these are the most detailed covid-19 case stats anywhere on the web. Help us by <a class="citationLink" href="#" onClick={() => {
                    this.setState({socialMediaIconsShown: true});
                    return false;
                }}>spreading the word</a>!

                <SocialMediaShareModal
                    addToURL="world"
                    visible={this.state.socialMediaIconsShown}
                    onCancel={() => this.setState({socialMediaIconsShown: false})}
                />
            </div>
            <div className="alert alert-warning" role="alert" style={{width: "100vw", margin: 0}}>
                    <FontAwesomeIcon icon={faExclamationCircle} /> <b>Note:</b> This page has data from
                    the <a href="https://github.com/mcyph/global_subnational_covid_data" style={{color: '#1277d3'}}>global-subnational-covid-data</a> project
                    which may contain errors or inconsistencies.
            </div>
            <div style={{width: '100%', maxWidth: '95vw'}}>
                <Grid container justify="center" wrap="wrap" style={{width: '100%'}}>
                    <Grid style={{minWidth: '95%'}} item xs={11} sm={11} md={10} lg={5}>
                        <div className="card">
                            <WorldMap stateName={"all"}
                                      dataType={"total"}
                                      timePeriod={21} />
                        </div>
                    </Grid>
                </Grid>
            </div>
            </>
        );
    }
}

export default WorldPage;
