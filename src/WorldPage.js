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

class WorldPage extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        // spacing={gspace}
        return (
            <div style={{width: '100%', maxWidth: '1500px'}}>
                <div style={{
                    border: '1px solid red',
                    borderLeft: 'none',
                    borderRight: 'none',
                    background: '#FEE',
                    textAlign: 'center',
                    margin: '20px auto 10px auto',
                    width: '95%'
                }}>
                    <b>Note:</b> This page is based on preliminary data from
                    the <a href="https://github.com/mcyph/covid_19_au_grab" style={{color: '#1277d3'}}>subnational-covid-data</a> project,
                    and may contain errors or inconsistencies.
                </div>

                <Grid container justify="center" wrap="wrap" style={{width: '100%'}}>
                    <Grid style={{minWidth: '95%'}} item xs={11} sm={11} md={10} lg={5}>
                        <div className="card">
                            <WorldMap stateName={"all"}
                                      dataType={"total"}
                                      timePeriod={14} />
                        </div>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export default WorldPage;
