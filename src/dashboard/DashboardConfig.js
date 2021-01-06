import React, { useState, Suspense, useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import CasesByStateTable from "../home/charts/CasesByStateTable";
import NationalStatTiles from "../home/national_stat_tiles/NationalStatTiles"
import EChartGlobalLog from "../home/charts/GlobalComparison";
import country from "../data/country.json";
import NationalCasesDeathsRecoveries from "../home/charts/NationalCasesDeathsRecoveries";
import Carousel from 'react-material-ui-carousel';
import all from "../data/overall.json";
import './DashboardConfig.css'
import Header from '../common/Header';

// if (window.location.pathname === "/dashboard") {
//     require('./DashboardConfig.css');
// }

export default function DashBoardConfig({ province, myData, overall, inputData, setProvince, area }) {

    let dashboardItemsPortrait = [
        <div >
            <Grid container spacing={0} justify="center" wrap="wrap">
                <Grid item xs={11} >
                    <NationalStatTiles
                        {...{ ...all, ...overall }}
                        name={province && province.name}
                        data={myData}
                        countryData={country}
                    />
                    <div className="card">
                        <Suspense fallback={<div className="loading">Loading...</div>}>
                            <CasesByStateTable area={area} onChange={setProvince} data={myData} />
                        </Suspense>
                    </div>
                </Grid>
            </Grid>
        </div>,
        <div>
            <Grid container spacing={0} justify="center" wrap="wrap">
                <Grid item xs={11} >
                    <NationalCasesDeathsRecoveries />
                </Grid>
                <Grid item xs={11} >
                    <EChartGlobalLog />
                </Grid>
            </Grid>
        </div>

    ]

    let dashboardItemsLandscape = [
        <Grid container spacing={2} justify="center" wrap="wrap">
            <Grid item xs={12} className="removePadding">
                <Header province={province} />
            </Grid>
            <Grid item xs={12} className="removePadding">
                <h2>We are still working on a landscape dashboard. Check back soon!</h2>
            </Grid>
        </Grid>]

    //[
    //     <Grid container spacing={2} justify="center" wrap="wrap">
    //         <Grid item xs={12} className="removePadding">
    //             <Header province={province} />
    //         </Grid>
    //         <Grid item xs={11} className="removePadding">

    //             <NationalStatTiles
    //                 {...{ ...all, ...overall }}
    //                 name={province && province.name}
    //                 data={myData}
    //                 countryData={country}
    //             />



    //         </Grid>
    //     </Grid>,
    //     <Grid container spacing={1} justify="center" wrap="wrap">
    //         <Grid item xs={12} className="removePadding">
    //             <Header province={province} />
    //         </Grid>
    //         <Grid item xs={6} >
    //             <div className="card">
    //                 <Suspense fallback={<div className="loading">Loading...</div>}>
    //                     <GoogleMap
    //                         province={province}
    //                         data={inputData}
    //                         onClick={name => {
    //                             const p = provincesByName[name];
    //                             if (p) {
    //                                 setProvince(p);
    //                             }
    //                         }}
    //                         newData={myData}
    //                     />
    //                 </Suspense>
    //             </div>
    //         </Grid>
    //         <Grid item xs={6} >
    //             <Suspense fallback={<div className="loading">Loading...</div>}>
    //                 <div className="card">
    //                     <h2>Detailed State Data</h2>
    //                     <Area area={area} onChange={setProvince} data={myData} />
    //                 </div>
    //             </Suspense>
    //         </Grid>
    //     </Grid>,
    //     <div style={{ flexGrow: 1 }}>
    //         <Grid container spacing={1} justify="center" wrap="wrap">

    //             <Grid item xs={12} className="removePadding">
    //                 <Header province={province} />
    //             </Grid>
    //             <Grid item xs={6} >
    //                 <OverallTrend />
    //                 {/*<StateComparisonChart />*/}
    //             </Grid>
    //             <Grid item xs={6} >
    //                 <EChartGlobalLog />
    //             </Grid>
    //         </Grid>
    //     </div>
    // ]

    console.log(inputData)


    if (window.innerHeight > window.innerWidth) {
        return (

            <Carousel interval="15000">
                {
                    dashboardItemsPortrait.map(item => (
                        <div>{item}</div>
                    )
                    )
                }
            </Carousel >
        )
    }
    else {
        return (
            <Carousel interval="15000">
                {
                    dashboardItemsLandscape.map(item => (
                        <div>{item}</div>
                    )
                    )
                }
            </Carousel>
        )
    }
}