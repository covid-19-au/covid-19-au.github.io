import React from "react";
import Grid from "@material-ui/core/Grid";
import Tweets from "./Tweets.js";
import NewsTimeline from "./NewsTimeline";
import TopNews from "./TopNews"



// News page showing a News Timeline and Twitter Feed
export default function NewsPage({ gspace, province, nav }) {
    return (
        <Grid container spacing={gspace} justify="center" wrap="wrap">

            <Grid item xs={11} sm={11} md={10} lg={5} xl={5}>
                <TopNews />
            </Grid>
            <Grid item xs={11} sm={11} md={10} lg={5} xl={5}>
                <NewsTimeline />
            </Grid>
            <Grid item xs={11} sm={11} md={10} lg={6} xl={5}>
                <Tweets province={province} nav={nav} />
            </Grid>


        </Grid>
    );
}
