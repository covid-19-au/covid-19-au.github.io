import Grid from "@material-ui/core/Grid";
import React from "react";
import ConfirmedMap from "./HomePage/ConfirmedMap";

class WorldPage extends React.Component {
    constructor() {
        super();
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
                            <ConfirmedMap stateName={"all"}
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
