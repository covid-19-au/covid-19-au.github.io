import React from "react";
import Grid from "@material-ui/core/Grid";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import DailyHistory from "./data/dailyFunArchive"
import uuid from "react-uuid";
import ReactPlayer from "react-player";

const panelStyles = {
    boxShadow: "none",
    margin: "0px"
};

const summaryStyles = {
    textAlign: "left",
    marginLeft: "0em",
    adding: "0px",
    marginRight: "1px",
    paddingLeft: "1em"
};

export default function DailyHistoryPage() {
    return (
        <Grid item xs={11} sm={11} md={10}>
            <div className="card" >


                <h2 className="responsiveH2">Daily History</h2>
                {DailyHistory.dailyFunStuff.map(stuff => (
                    <div key={uuid()}>
                        <div>
                            {/* Check /data/DailyHistory.json for the information. Format is: Image/video, description, additional text, date, and type.
                        */}
                            <div>
                                <ExpansionPanel style={{ boxShadow: "none" }} >
                                {/* First image */}

                                < ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}
                                                            aria-controls="panel1a-content"
                                                            id="panel1a-header"
                                                            style={{ textAlign: "left", marginLeft: "1em", padding: "0px", marginRight: "1px" }}>
                                    <h3 className="responsiveH3">{stuff.date}</h3>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails style={{ textAlign: "left", marginLeft: "1em", padding: "0px" }}>
                                {stuff.image.map(i1 => (
                                    <div key={uuid()}>
                                        <div className="row centerMedia">
                                            <div className="imageContainer" style={{ height: "auto" }} >
                                                <img
                                                    className="formatImage"
                                                    src={i1.imgLink}
                                                    alt={i1.name}
                                                    style={{}}
                                                />
                                                <small className="mediaText" >{i1.name}</small>
                                                <br />
                                                <a href={i1.source} style={{ color: "#3366BB" }}>{i1.description}</a>
                                            </div>
                                        </div>

                                    </div>
                                ))}
                                {/* Video */}
                                {stuff.video.map(vid => (
                                    <div key={uuid()} className="row centerMedia">
                                        <div>
                                            <ReactPlayer alt={vid.name} className="formatMedia" url={vid.link} controls={true} config={{ youtube: { playerVars: { showinfo: 1 } } }} />
                                            <small className="mediaText">{vid.description}</small>
                                        </div>
                                    </div>
                                ))}
                                </ExpansionPanelDetails>

                                </ExpansionPanel>
                            </div>
                        </div>
                    </div>
                ))
                }
                </div>
        </Grid>
    )
}

