import React from "react";
import Grid from "@material-ui/core/Grid";


function Blog(props) {
    return(
        <Grid item xs={11} sm={11} md={10}>
            <div className="card">
                <h2 className="responsiveH2">Blog</h2>
            </div>
        </Grid>
    )
}

export default Blog;