import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import topNewsData from "./data/topNewsData"
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import uuid from "react-uuid";
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Link from '@material-ui/core/Link';
import IconButton from '@material-ui/core/IconButton';
import LinkIcon from '@material-ui/icons/Link';
import Button from '@material-ui/core/Button';

const newsData = topNewsData.weeklyTopNews


const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        maxWidth: '36ch',
        backgroundColor: theme.palette.background.paper,
    },
    inline: {
        display: 'inline',
    },
}));

const listStyles = {
    maxHeight: 450,
    position: 'relative',
    overflow: 'auto',
    minHeight: 100,
    marginRight: 0,
    padding: 0
}


function TopNews() {
    const classes = useStyles()
    let logoLocation = ""
    return (

        <div className="card">
            <h2>Top News</h2>

            <List style={listStyles}>
                {newsData.map(news =>
                    <div className="card" style={{ padding: "5px" }}>
                        <ListItem alignItems="flex-start" key={uuid()}>
                            < ExpansionPanel style={{ boxShadow: "none" }} >
                                < ExpansionPanelSummary expandIcon={< ExpandMoreIcon />}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                    style={{ textAlign: "left", padding: "0px" }}>
                                    <ListItemAvatar>
                                        <Avatar style={{ marginTop: "0.rem", marginRight: "1rem", width: "48px", height: "48px" }} src={require("./img/newsLogos/" + news.source + ".jpg")} />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <React.Fragment>
                                                <Typography
                                                    variant="body1"
                                                    className={classes.inline}
                                                    color="textPrimary"
                                                >
                                                    {news.title}
                                                </Typography>
                                            </React.Fragment>
                                        }
                                        secondary={
                                            <React.Fragment>
                                                <Typography
                                                    component="span"
                                                    variant="body2"
                                                    className={classes.inline}
                                                    color="textPrimary"
                                                >
                                                    {news.date}
                                                </Typography>
                                            </React.Fragment>
                                        }
                                    />

                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails style={{ textAlign: "left", marginLeft: "1em", padding: "0px", flexDirection: "column" }}>
                                    <Typography>
                                        {news.summary}
                                    </Typography>
                                    <div align="right" style={{ marginRight: "2rem" }}>
                                        <IconButton
                                            variant="contained"
                                            className={classes.button}
                                            href={news.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            /*startIcon={<LinkIcon />}*/
                                            size="medium"
                                            style={{
                                                backgroundColor: "#e3f3ff"
                                            }}
                                        ><LinkIcon />
                                        </IconButton>
                                    </div>

                                </ExpansionPanelDetails>
                            </ ExpansionPanel>
                        </ListItem>
                    </div>
                )
                }

            </List >
        </div >)
}

export default TopNews

