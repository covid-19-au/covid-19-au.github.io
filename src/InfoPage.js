import React, { useState } from "react";
import {
    useTable,
    useFilters,
    useGlobalFilter,
    usePagination
} from "react-table";
import ReactPlayer from "react-player";
import uuid from "react-uuid";
import Grid from "@material-ui/core/Grid";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import dailyFun from "./data/dailyFun"
import information from "./data/info";
import mapDataHos from "./data/mapdataHos";
// import i18n bundle
import i18next from './i18n';
import ReactGA from "react-ga";
import ReactHtmlParser from 'react-html-parser';
import { A } from 'hookrouter';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import Fab from '@material-ui/core/Fab';
import MenuIcon from '@material-ui/icons/Menu';
import Typography from '@material-ui/core/Typography';
import { Link, animateScroll as scroll } from "react-scroll";
import CloseIcon from '@material-ui/icons/Close';


// Info page to present information about the virus.



export default function InfoPage({ columns, gspace }) {

    const [drawerOpen, setDrawerOpen] = useState(false)

    const stateAbrev = {
        "Victoria": "VIC",
        "New South Wales": "NSW",
        "Queensland": 'QLD',
        "Tasmania": 'TAS',
        "South Australia": "SA",
        "Western Australia": "WA",
        "Northern Territory": "NT",
        "Australian Capital Territory": "ACT"
    }

    const abrevs = ["VIC", "NSW", "QLD", "TAS", "SA", "WA", "NT", "ACT"];


    mapDataHos.forEach(hosData => {
        let hosState = hosData.state;
        if (!abrevs.includes(hosState)) {
            hosData.state = stateAbrev[hosState];
        }
    })

    const hospitalData = React.useMemo(() => mapDataHos, []);

    return (
        <Grid item xs={11} sm={11} md={10}>
            <Information columns={columns} hospitalData={hospitalData} gspace={gspace} />
        </Grid>
    )
}


function InfoDrawer() {
    const [state, setState] = React.useState(false);

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }

        setState(open);
    };

    const sections = [
        { id: "dailyDistractions", title: "Daily Distraction" },
        { id: "media", title: "Informative Media" },
        { id: "general", title: "General Information" },
        { id: "regulations", title: "Current Regulations" },
        { id: "tracingApp", title: "Contact Tracing App" },
        { id: "haveCovid", title: "Think you have COVID-19?" },
        { id: "stateTesting", title: "State Testing Information" },
        { id: "protect", title: "Protecting Yourself and Others" },
        { id: "helplines", title: "Helplines" },
        { id: "other", title: "Other interesting links" },
        { id: "hospitalList", title: "List of Hospitals doing Coronavirus testing" }
    ]

    const list = () => (
        <div
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
        >
            <Grid container direction="row" alignItems="center" style={{ backgroundColor: "#bae1ff", paddingLeft: "0px", paddingTop: "0.5rem", paddingBottom: "0.5rem", marginBottom: "0px" }}>
                <Grid item >
                    <Typography variant="h4" align="left" style={{ marginLeft: "1rem" }}>
                        Sections
                </Typography>
                </Grid>
                <Grid item style={{
                    alignSelf: "flex-end", marginLeft: "auto", marginRight: "0.8rem", marginBottom: "0.2rem"
                }}>
                    <CloseIcon onClick={toggleDrawer(false)} fontSize="large" />
                </Grid>
            </Grid>
            <List style={{ marginTop: "0px" }}>
                {sections.map((section, index) => (
                    <div>
                        <ListItem fullWidth="true">
                            <Button fullWidth="true" size="small" style={{ textTransform: "none", padding: "0px", marginTop: 0 }}>
                                <Link
                                    activeClass="active"
                                    to={section["id"]}
                                    spy={true}
                                    smooth={true}
                                    offset={-60}
                                    duration={700}
                                    onClick={toggleDrawer(false)}
                                    style={{ width: "100%" }}
                                ><Typography align="left" variant="h6">{index + 1}. {section["title"]}</Typography></Link></Button>

                        </ListItem>
                        <Divider />
                    </div>
                ))}
            </List>

        </div>
    );

    return (
        <div>
            <React.Fragment>
                <Fab size="medium" color="secondary" aria-label="menu" onClick={toggleDrawer(true)} style={{
                    position: "fixed", zIndex: 95,
                    bottom: "3rem",
                    right: "2rem", backgroundColor: "#8ccfff"
                }}>
                    <MenuIcon style={{ color: "black" }} />
                </Fab>
                <Drawer anchor={'bottom'} open={state} onClose={toggleDrawer(false)}  >
                    {list()}
                </Drawer>
            </React.Fragment>
        </div>
    );
}

function Information({ hospitalData, columns, gspace }) {


    return (

        <Grid container spacing={gspace} justify="center" wrap="wrap">

            <InfoDrawer></InfoDrawer>


            <Grid item xs={11} sm={11} md={10} lg={6} xl={3}>
                <div className="card" id="dailyDistractions">
                    <h2 className="responsiveH2">{i18next.t("infoPage:dailyDistraction.title")}</h2>
                    {dailyFun.dailyFunStuff.map(stuff => (
                        stuff.type === "motivation" ? (
                            <div key={uuid()}>
                                <div className="shadow-none p-3 mb-5 bg-light rounded">
                                    <h4 style={{ textAlign: 'center' }}>{stuff.title}</h4>
                                    {stuff.image.map(i1 => (
                                        <div key={uuid()}>
                                            <div className=" centerMedia">
                                                <div style={{ height: "auto", margin: 0 }} >
                                                    <img
                                                        src={i1.imgLink}
                                                        alt={i1.name}
                                                        style={{ maxWidth: "98%", maxHeight: "400px" }}
                                                    />

                                                </div>
                                                <a href={i1.source} style={{ color: "grey" }}><u>Image Source</u></a>
                                            </div>

                                        </div>
                                    ))}

                                    <div>{ReactHtmlParser(stuff.content)}</div>

                                    <br />
                                    {/* Citation tag */}
                                    {stuff.citation.map(cit => (<div key={uuid()} >
                                        <small ><a className="citationLink" target="_blank" rel="noopener noreferrer" href={cit.link}>{cit.name}</a></small><br />
                                    </div>
                                    ))}

                                </div>
                            </div>
                        ) :
                            (<div key={uuid()}>
                                <div>
                                    {/* Check /data/dailyFun.json for the information. Format is: Image/video, description, additional text.
                        */}
                                    <div>
                                        {/* First image */}
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
                                                    <ReactPlayer width="100%" height="100%" alt={vid.name} className="formatMedia" url={vid.link} controls={true} config={{ youtube: { playerVars: { showinfo: 1 } } }} />
                                                    <small className="mediaText">{vid.description}</small>
                                                </div>
                                            </div>
                                        ))}

                                    </div>
                                </div>
                            </div>)
                    ))
                    }

                    <p style={{ textAlign: "center" }}>{i18next.t("infoPage:dailyDistraction.body1")}</p>
                    <p style={{ textAlign: "center" }}><A href="/dailyHistory"><span style={{ color: "#3366BB" }} onClick={() => {
                        ReactGA.event({ category: 'DailyStory', action: "more" });
                        window.scrollTo(0, 0);
                    }}>{i18next.t("infoPage:dailyDistraction.link")}</span></A> {i18next.t("infoPage:dailyDistraction.body2")}</p>
                    {/*<p style={{ textAlign: "center" }}>If you have something that you would like us to share, you can click <a style={{ color: "#3366BB" }} target="_blank"*/}
                    {/*rel="noopener noreferrer" href="https://docs.google.com/forms/d/e/1FAIpQLScPl8U9tILO2wD1xbtkz1pDTW0wBcAlcIb3cnJvnvUahAZEuw/viewform?usp=sf_link">{"me!"}</a> </p>*/}
                </div>
                <div className="card" >
                    <h2 className="responsiveH2" id="media">{i18next.t("infoPage:informativeMedia:title")}</h2>
                    <div className="row centerMedia">
                        <div>
                            <ReactPlayer width="100%" height="100%" alt="Coronavirus explained and how to protect yourself from COVID-19" className="formatMedia" url="http://www.youtube.com/watch?v=BtN-goy9VOY" controls={true} config={{ youtube: { playerVars: { showinfo: 1 } } }} />
                            <small className="mediaText">{i18next.t("infoPage:informativeMedia:media1Descrip")}</small>
                        </div>
                    </div>

                    <div className="row centerMedia">
                        <div>
                            <ReactPlayer width="100%" height="100%" alt="How to wash hands - Coronavirus / COVID-19" className="formatMedia" url="https://vp.nyt.com/video/2020/03/12/85578_1_HowToWashYourHands_wg_1080p.mp4" playing={true} loop={true} />
                            <small className="mediaText">{i18next.t("infoPage:informativeMedia:media2Descrip")}</small> <br />
                            <small style={{ color: "#3366BB" }}><a target="_blank"
                                rel="noopener noreferrer"
                                href={"https://i.dailymail.co.uk/1s/2020/03/03/02/25459132-8067781-image-a-36_1583202968115.jpg"}>{"Here's a step-by-step guide you can save"}</a></small>
                        </div>
                    </div>

                    <div className="row centerMedia">
                        <div>
                            <ReactPlayer width="100%" height="100%" alt="How to wear a mask - Coronavirus / COVID-19" className="formatMedia" url="https://www.youtube.com/watch?v=M4olt47pr_o" controls={true} />
                            <small className="mediaText">When and how to wear medical masks to protect against the new coronavirus.</small>
                        </div>
                    </div>
                </div>
            </Grid>
            <Grid item xs={11} sm={11} md={10} lg={6} xl={3}>
                <div className="card" id="general">

                    <h2 className="responsiveH2">{i18next.t("infoPage:generalInformation:title")}</h2>
                    {information.generalCovidInfo.map(info => (
                        <div key={uuid()}>
                            <div>
                                <ExpansionPanel style={{ boxShadow: "none" }} >
                                    {/* Check /data/info.json for the information. Format is: Block of text, Unordered list, Block of text.
                        This is so that we can reduce code smell while still retaining the ability to format text.
                        Guide to adding more info points:
                            - In all arrays under info.text (E.g. text_1, ulist_1), each new element in the array is a new line for text blocks, or a new list item for list blocks.
                        */}
                                    < ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1a-content"
                                        id="panel1a-header"
                                        style={{ textAlign: "left", marginLeft: "1em", padding: "0px", marginRight: "1px" }}>
                                        <h3 className="responsiveH3">{info.name}</h3>
                                    </ExpansionPanelSummary>
                                    <ExpansionPanelDetails style={{ textAlign: "left", marginLeft: "1em", padding: "0px" }}>
                                        <div>
                                            {/* First block of text */}
                                            {info.text.text_1.map(t1 => (
                                                <p key={uuid()}>{t1}</p>
                                            ))}
                                            {/* First Unordered List */}
                                            {info.text.ulist_1 ? (
                                                <ul>
                                                    {info.text.ulist_1.map(ul1 => (
                                                        <li key={uuid()}>{ul1}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                    ""
                                                )}

                                            {/* First Ordered List */}
                                            {info.text.olist_1 ? (
                                                <ol>
                                                    {info.text.olist_1.map(ol1 => (
                                                        <li key={uuid()}>{ol1}</li>
                                                    ))}
                                                </ol>
                                            ) : (
                                                    ""
                                                )}

                                            {/* Second Block of text */}
                                            {info.text.text_2.map(t2 => (
                                                <p key={uuid()}>{t2}</p>
                                            ))}

                                            {/* Citation tag */}
                                            {info.text.citation.map(cit => (<div key={uuid()}>
                                                <small ><a className="citationLink" target="_blank" rel="noopener noreferrer" href={cit.link}>{cit.name}</a></small><br />
                                            </div>
                                            ))}
                                        </div>
                                    </ExpansionPanelDetails>
                                </ExpansionPanel>
                            </div>
                        </div>
                    ))
                    }</div>
                <div className="card" id="regulations">
                    <h2 className="responsiveH2">{i18next.t("infoPage:currentRegulation:title")}</h2>
                    {information.regulations.map(info => (
                        <div key={uuid()}>
                            <div>
                                <ExpansionPanel style={{ boxShadow: "none" }} >

                                    {/* Check /data/info.json for the information. Format is: Block of text, Unordered list, Block of text.
                        This is so that we can reduce code smell while still retaining the ability to format text.
                        Guide to adding more info points:
                            - In all arrays under info.text (E.g. text_1, ulist_1), each new element in the array is a new line for text blocks, or a new list item for list blocks.
                        */}
                                    < ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1a-content"
                                        id="panel1a-header"
                                        style={{ textAlign: "left", marginLeft: "1em", padding: "0px", marginRight: "1px" }}>
                                        <h3 className="responsiveH3">{info.name}</h3>
                                    </ExpansionPanelSummary>
                                    <ExpansionPanelDetails style={{ textAlign: "left", marginLeft: "1em", padding: "0px" }}>
                                        <div>
                                            {/* First block of text */}
                                            {info.text.text_1.map(t1 => (
                                                <p key={uuid()}>{t1}</p>
                                            ))}
                                            {/* First Unordered List */}
                                            {info.text.ulist_1 ? (
                                                <ul>
                                                    {info.text.ulist_1.map(ul1 => (
                                                        <li key={uuid()}>{ul1}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                    ""
                                                )}

                                            {/* Middle Block of text */}
                                            {info.text.text_middle.map(t2 => (
                                                <p key={uuid()}>{t2}</p>
                                            ))}

                                            {/* First Ordered List */}
                                            {info.text.olist_1 ? (
                                                <ol>
                                                    {info.text.olist_1.map(ol1 => (
                                                        <li key={uuid()}>{ol1}</li>
                                                    ))}
                                                </ol>
                                            ) : (
                                                    ""
                                                )}

                                            {/* Third Block of text */}
                                            {info.text.text_2.map(t2 => (
                                                <p key={uuid()}>{t2}</p>
                                            ))}

                                            {/* Citation tag */}
                                            {info.text.citation.map(cit => (<div>
                                                <small key={uuid()}><a className="citationLink" target="_blank" rel="noopener noreferrer" href={cit.link}>{cit.name}</a></small><br />
                                            </div>
                                            ))}
                                        </div>
                                    </ExpansionPanelDetails>
                                </ExpansionPanel>
                            </div>
                        </div>
                    ))
                    }
                </div>
                <div className="card" id="tracingApp">
                    <h2 className="responsiveH2">Contact Tracing App</h2>
                    {information.tracingApp.map(info => (
                        <div key={uuid()}>
                            <div>
                                <ExpansionPanel style={{ boxShadow: "none" }} >

                                    {/* Check /data/info.json for the information. Format is: Block of text, Unordered list, Block of text.
                        This is so that we can reduce code smell while still retaining the ability to format text.
                        Guide to adding more info points:
                            - In all arrays under info.text (E.g. text_1, ulist_1), each new element in the array is a new line for text blocks, or a new list item for list blocks.
                        */}
                                    < ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1a-content"
                                        id="panel1a-header"
                                        style={{ textAlign: "left", marginLeft: "1em", padding: "0px", marginRight: "1px" }}>
                                        <h3 className="responsiveH3">{info.name}</h3>
                                    </ExpansionPanelSummary>
                                    <ExpansionPanelDetails style={{ textAlign: "left", marginLeft: "1em", padding: "0px" }}>
                                        <div>
                                            {/* First block of text */}
                                            {info.text.text_1.map(t1 => (
                                                <p key={uuid()}>{t1}</p>
                                            ))}
                                            {/* First Unordered List */}
                                            {info.text.list_1 ? (
                                                <ul>
                                                    {info.text.list_1.map(l1 => (
                                                        <li key={uuid()}>{l1}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                    ""
                                                )}

                                            {/* Second Block of text */}
                                            {info.text.text_2.map(t2 => (
                                                <p key={uuid()}>{t2}</p>
                                            ))}

                                            {/* First Ordered List */}
                                            {info.text.list_2 ? (
                                                <ul>
                                                    {info.text.list_2.map(l2 => (
                                                        <li key={uuid()}>{l2}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                    ""
                                                )}

                                            {/* Second Block of text */}
                                            {info.text.text_3.map(t3 => (
                                                <p key={uuid()}>{t3}</p>
                                            ))}

                                            {/* Citation tag */}
                                            {info.text.citation.map(cit => (<div>
                                                <small key={uuid()}><a className="citationLink" target="_blank" rel="noopener noreferrer" href={cit.link}>{cit.name}</a></small><br />
                                            </div>
                                            ))}

                                            {/* last updated */}
                                            <br />
                                            <div>
                                                <small key={uuid()}>Last updated: {info.text.lastUpdated}</small><br />
                                            </div>
                                        </div>
                                    </ExpansionPanelDetails>
                                </ExpansionPanel>
                            </div>
                        </div>
                    ))
                    }</div>

            </Grid>
            <Grid item xs={11} sm={11} md={10} lg={6} xl={3}>

                <div className="card" id="haveCovid">
                    <h2 className="responsiveH2">{i18next.t("infoPage:selfDiagnosis:title")}</h2>
                    {information.haveCovid.map(info => (
                        <div key={uuid()}>
                            <div>
                                <ExpansionPanel style={{ boxShadow: "none" }} >

                                    {/* Check /data/info.json for the information. Format is: Block of text, Unordered list, Block of text.
                        This is so that we can reduce code smell while still retaining the ability to format text.
                        Guide to adding more info points:
                            - In all arrays under info.text (E.g. text_1, ulist_1), each new element in the array is a new line for text blocks, or a new list item for list blocks.
                        */}
                                    < ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1a-content"
                                        id="panel1a-header"
                                        style={{ textAlign: "left", marginLeft: "1em", padding: "0px", marginRight: "1px" }}>
                                        <h3 className="responsiveH3">{info.name}</h3>
                                    </ExpansionPanelSummary>
                                    <ExpansionPanelDetails style={{ textAlign: "left", marginLeft: "1em", padding: "0px" }}>
                                        <div>
                                            {/* First block of text */}
                                            {info.text.text_1.map(t1 => (
                                                <p key={uuid()}>{t1}</p>
                                            ))}
                                            {/* First Unordered List */}
                                            {info.text.ulist_1 ? (
                                                <ul>
                                                    {info.text.ulist_1.map(ul1 => (
                                                        <li key={uuid()}>{ul1}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                    ""
                                                )}

                                            {/* First Ordered List */}
                                            {info.text.olist_1 ? (
                                                <ol>
                                                    {info.text.olist_1.map(ol1 => (
                                                        <li key={uuid()}>{ol1}</li>
                                                    ))}
                                                </ol>
                                            ) : (
                                                    ""
                                                )}

                                            {/* Second Block of text */}
                                            {info.text.text_2.map(t2 => (
                                                <p key={uuid()}>{t2}</p>
                                            ))}

                                            {/* Reference to state criteria */}{
                                                info.text.reference ? info.text.reference.map(r => (
                                                    <strong> <p>{r.text}
                                                        <Link
                                                            activeClass="active"
                                                            to={r.link}
                                                            spy={true}
                                                            smooth={true}
                                                            offset={-60}
                                                            duration={700}
                                                            style={{ width: "100%", color: "#3366BB" }}
                                                        >{r.linkText}</Link></p></strong>
                                                )) : ""
                                            }
                                            <br />

                                            {/* Citation tag */}
                                            {info.text.citation.map(cit => (<div>
                                                <small key={uuid()}><a className="citationLink" target="_blank" rel="noopener noreferrer" href={cit.link}>{cit.name}</a></small><br />
                                            </div>
                                            ))}
                                        </div>
                                    </ExpansionPanelDetails>
                                </ExpansionPanel>
                            </div>
                        </div>
                    ))
                    }</div>

                <div className="card" id="stateTesting">
                    <h2 className="responsiveH2">State Testing Information</h2>
                    {information.stateTesting.map(info => (
                        <div key={uuid()}>
                            <div>
                                <ExpansionPanel style={{ boxShadow: "none" }} >

                                    {/* Check /data/info.json for the information. Format is: Block of text, Unordered list, Block of text.
                        This is so that we can reduce code smell while still retaining the ability to format text.
                        Guide to adding more info points:
                            - In all arrays under info.text (E.g. text_1, ulist_1), each new element in the array is a new line for text blocks, or a new list item for list blocks.
                        */}
                                    < ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1a-content"
                                        id="panel1a-header"
                                        style={{ textAlign: "left", marginLeft: "1em", padding: "0px", marginRight: "1px" }}>
                                        <h3 className="responsiveH3">{info.name}</h3>
                                    </ExpansionPanelSummary>
                                    <ExpansionPanelDetails style={{ textAlign: "left", marginLeft: "1em", padding: "0px" }}>
                                        <div>
                                            {/* First block of text */}
                                            {info.text.text_1.map(t1 => (
                                                <p key={uuid()}>{t1}</p>
                                            ))}
                                            {/* First Unordered List */}
                                            {info.text.list_1 ? (
                                                <ul>
                                                    {info.text.list_1.map(l1 => (
                                                        <li key={uuid()}>{l1}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                    ""
                                                )}

                                            {/* Second Block of text */}
                                            {info.text.text_2.map(t2 => (
                                                <p key={uuid()}>{t2}</p>
                                            ))}

                                            {/* First Ordered List */}
                                            {info.text.list_2 ? (
                                                <ul>
                                                    {info.text.list_2.map(l2 => (
                                                        <li key={uuid()}>{l2}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                    ""
                                                )}

                                            {/* Second Block of text */}
                                            {info.text.text_3.map(t3 => (
                                                <p key={uuid()}>{t3}</p>
                                            ))}

                                            {/* Citation tag */}
                                            {info.text.citation.map(cit => (<div>
                                                <small key={uuid()}><a className="citationLink" target="_blank" rel="noopener noreferrer" href={cit.link}>{cit.name}</a></small><br />
                                            </div>
                                            ))}

                                            {/* last updated */}
                                            <br />
                                            <div>
                                                <small key={uuid()}>Last updated: {info.text.lastUpdated}</small><br />
                                            </div>
                                        </div>
                                    </ExpansionPanelDetails>
                                </ExpansionPanel>
                            </div>
                        </div>
                    ))
                    }
                </div>
                <div className="card" id="protect">
                    <h2 className="responsiveH2">{i18next.t("infoPage:prevention:title")}</h2>

                    {information.protect.map(info => (
                        <div key={uuid()}>
                            <div>
                                <ExpansionPanel style={{ boxShadow: "none" }} >

                                    {/* Check /data/info.json for the information. Format is: Block of text, Unordered list, Block of text.
                        This is so that we can reduce code smell while still retaining the ability to format text.
                        Guide to adding more info points:
                            - In all arrays under info.text (E.g. text_1, ulist_1), each new element in the array is a new line for text blocks, or a new list item for list blocks.
                        */}
                                    < ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1a-content"
                                        id="panel1a-header"
                                        style={{ textAlign: "left", marginLeft: "1em", padding: "0px", marginRight: "1px" }}>
                                        <h3 className="responsiveH3">{info.name}</h3>
                                    </ExpansionPanelSummary>
                                    <ExpansionPanelDetails style={{ textAlign: "left", marginLeft: "1em", padding: "0px" }}>
                                        <div>
                                            {/* First image */}
                                            {info.image_1.map(i1 => (
                                                <div className="row centerMedia" key={uuid()}>
                                                    <div className="imageContainer" style={{ height: "auto" }} >
                                                        <img
                                                            className="formatImage"
                                                            src={i1}
                                                            alt="Flatten the curve gif"
                                                            style={{}}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            {/* First block of text */}
                                            {info.text.text_1.map(t1 => (
                                                <p key={uuid()}>{t1}</p>
                                            ))}
                                            {/* First Unordered List */}
                                            {info.text.ulist_1 ? (
                                                <ul>
                                                    {info.text.ulist_1.map(ul1 => (
                                                        <li key={uuid()}>{ul1}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                    ""
                                                )}

                                            {/* First Ordered List */}
                                            {info.text.olist_1 ? (
                                                <ol>
                                                    {info.text.olist_1.map(ol1 => (
                                                        <li key={uuid()}>{ol1}</li>
                                                    ))}
                                                </ol>
                                            ) : (
                                                    ""
                                                )}

                                            {/* Second Block of text */}
                                            {info.text.text_2.map(t2 => (
                                                <p key={uuid()}>{t2}</p>
                                            ))}

                                            {/* Citation tag */}
                                            {info.text.citation.map(cit => (<div>
                                                <small key={uuid()}><a className="citationLink" target="_blank" rel="noopener noreferrer" href={cit.link}>{cit.name}</a></small><br />
                                            </div>
                                            ))}
                                            {/* Video */}
                                            {info.video_1.map(vid => (
                                                <div className="row centerMedia" key={uuid()}>
                                                    <div>
                                                        <ReactPlayer width="100%" height="100%" alt="Coronavirus explained and how to protect yourself from COVID-19"
                                                            className="formatMedia"
                                                            url={vid.link}
                                                            controls={true}
                                                            config={{ youtube: { playerVars: { showinfo: 1 } } }} />
                                                        <small className="mediaText">{vid.desc}</small>
                                                    </div>
                                                </div>
                                            ))}

                                        </div>
                                    </ExpansionPanelDetails>
                                </ExpansionPanel>
                            </div>
                        </div>
                    ))
                    }</div>

            </Grid>
            <Grid item xs={11} sm={11} md={10} lg={6} xl={3}>

                <div className="card" id="helplines">
                    <h2 className="responsiveH2">{i18next.t("infoPage:coronavirusHelpline:title")}</h2>


                    {information.helplines.map(info => (
                        <div key={uuid()}>
                            <div>
                                <ExpansionPanel style={{ boxShadow: "none" }} >

                                    {/* Check /data/info.json for the information. Format is: Block of text, Unordered list, Block of text.
                        This is so that we can reduce code smell while still retaining the ability to format text.
                        Guide to adding more info points:
                            - In all arrays under info.text (E.g. text_1, ulist_1), each new element in the array is a new line for text blocks, or a new list item for list blocks.
                        */}
                                    < ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1a-content"
                                        id="panel1a-header"
                                        style={{ textAlign: "left", marginLeft: "1em", padding: "0px", marginRight: "1px" }}>
                                        <h3 className="responsiveH3">{info.name}</h3>
                                    </ExpansionPanelSummary>
                                    <ExpansionPanelDetails style={{ textAlign: "left", marginLeft: "1em", padding: "0px" }}>
                                        <div>
                                            {/* First block of text */}
                                            {info.text.text_1.map(t1 => (
                                                <p key={uuid()}>{t1}</p>
                                            ))}
                                            {/* First number List */}
                                            {info.text.numberList_1 ? (
                                                <ul>
                                                    {info.text.numberList_1.map(helpline => ([

                                                        <li key={uuid()}>{helpline.text} <a className={"citationLink"} href={helpline.numberLink}>{helpline.numberDisplay}</a></li>,
                                                        helpline.extras ? <ul>{helpline.extras.map(extra => [
                                                            <li key={uuid()}>{extra.text} <a className={"citationLink"} href={extra.numberLink}>{extra.numberDisplay}</a></li>,
                                                            extra.link ? <li>Website: <a className={"citationLink"} target="_blank" rel="noopener noreferrer" href={extra.link}>{extra.link}</a></li> : ""])}

                                                        </ul> : ""
                                                    ]))}
                                                </ul>
                                            ) : (
                                                    ""
                                                )}

                                            {/* Middle Block of text */}
                                            {info.text.text_2.map(t2 => (
                                                <p key={uuid()}>{t2}</p>
                                            ))}

                                            {/* Second Number List */}
                                            {info.text.numberList_2 ? (
                                                <ul>
                                                    {info.text.numberList_2.map(helpline => ([

                                                        <li key={uuid()}>{helpline.text} <a className={"citationLink"} href={helpline.numberLink}>{helpline.numberDisplay}</a></li>,
                                                        helpline.extras ? <ul>{helpline.extras.map(extra => [
                                                            <li key={uuid()}>{extra.text} <a className={"citationLink"} href={extra.numberLink}>{extra.numberDisplay}</a></li>,
                                                            extra.link ? <li>Website: <a className={"citationLink"} target="_blank" rel="noopener noreferrer" href={extra.link}>{extra.link}</a></li> : ""])}

                                                        </ul> : ""
                                                    ]))}
                                                </ul>
                                            ) : (
                                                    ""
                                                )}
                                            {/* Citation tag */}
                                            {info.text.citation.map(cit => (<div>
                                                <small key={uuid()}><a className="citationLink" target="_blank" rel="noopener noreferrer" href={cit.link}>{cit.name}</a></small><br />
                                            </div>
                                            ))}
                                        </div>
                                    </ExpansionPanelDetails>
                                </ExpansionPanel>
                            </div>
                        </div>
                    ))
                    }

                </div>
                <div className="card" id="other">
                    <h2 className="responsiveH2">{i18next.t("infoPage:interestingLinks:title")}</h2>
                    <div className="row alignStyles responsiveText">
                        <div>
                            <ul>
                                <li><a className="citationLink" target="_blank" rel="noopener noreferrer" href="https://medium.com/@tomaspueyo/coronavirus-the-hammer-and-the-dance-be9337092b56">Coronavirus: The Hammer and the Dance</a></li>
                                <li><a className="citationLink" target="_blank" rel="noopener noreferrer" href="https://www.nytimes.com/news-event/coronavirus">The New York Times</a> and the <a className="citationLink" target="_blank" rel="noopener noreferrer" href="https://www.economist.com/news/2020/03/11/the-economists-coverage-of-the-coronavirus">Economist</a> are giving people free access to their coronavirus coverage. It's really good!</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="card" id="hospitalList" >
                    <h2 className="responsiveH2">List of Hospitals doing Coronavirus testing</h2>
                    <p className="responsiveText"><strong>Note: </strong>For anyone in Tasmania, all four testing clinics will not be open for walk-up testing, and anyone who thinks they may need testing should first contact the Public Health Hotline on <a className="citationLink" href="tel:1800671738">1800 671 738</a></p>
                    <small>Filter the table by clicking the dropdown below state.</small>
                    <div className="row centerMedia">
                        <div>
                            <Table className="formatMedia" columns={columns} data={hospitalData} />
                        </div>
                    </div>
                </div >
            </Grid>
        </Grid>
    );
}


// Let the table remove the filter if the string is empty
// Our table component
function Table({ columns, data }) {
    const filterTypes = React.useMemo(
        () => ({
            // Or, override the default text filter to use
            // "startWith"
            text: (rows, id, filterValue) => {
                return rows.filter(row => {
                    const rowValue = row.values[id]
                    return rowValue !== undefined
                        ? String(rowValue)
                            .toLowerCase()
                            .startsWith(String(filterValue).toLowerCase())
                        : true
                })
            },
        }),
        []
    )

    const defaultColumn = React.useMemo(
        () => ({
            // Let's set up our default Filter UI
            Filter: DefaultColumnFilter,
        }),
        []
    )

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page,
        prepareRow,
        visibleColumns,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: { pageIndex, pageSize },
    } = useTable(
        {
            columns,
            data,
            defaultColumn, // Be sure to pass the defaultColumn option
            filterTypes,
            initialState: { pageIndex: 0 },
        },
        useFilters, // useFilters!
        useGlobalFilter, // useGlobalFilter!
        usePagination
    )

    // We don't want to render all of the rows for this example, so cap
    // it for this use case
    //   const firstPageRows = rows.slice(0, 10)

    return (
        <>
            <div className="row">
                <div>
                    <table className="formatTable" {...getTableProps()}>
                        <thead className="tableRows">
                            {headerGroups.map(headerGroup => (
                                <tr {...headerGroup.getHeaderGroupProps()}>
                                    {headerGroup.headers.map(column => (
                                        <th className="tableData" {...column.getHeaderProps()}>
                                            {column.render('Header')}
                                            {/* Render the columns filter UI */}
                                            <div>{column.canFilter ? column.render('Filter') : null}</div>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                            <tr>
                                <th
                                    colSpan={visibleColumns.length}
                                    style={{
                                        textAlign: 'left',
                                    }}
                                >
                                </th>
                            </tr>
                        </thead>
                        <tbody {...getTableBodyProps()}>
                            {page.map((row, i) => {
                                prepareRow(row)
                                return (
                                    <tr className="tableRows" {...row.getRowProps()}>
                                        {row.cells.map(cell => {
                                            return <td className="tableData" {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                        })}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    <div className="pagination">
                        <button className="buttonStyles" onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                            {'<<'}
                        </button>{' '}
                        <button className="buttonStyles" onClick={() => previousPage()} disabled={!canPreviousPage}>
                            {'<'}
                        </button>{' '}
                        <button className="buttonStyles" onClick={() => nextPage()} disabled={!canNextPage}>
                            {'>'}
                        </button>{' '}
                        <button className="buttonStyles" onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                            {'>>'}
                        </button>{' '}
                        <span style={{ marginRight: "1em", marginLeft: "1em" }}>
                            Page{' '}
                            <strong>
                                {pageIndex + 1} of {pageOptions.length}
                            </strong>{' '}
                        </span>
                        <select
                            className="customStateSelect"
                            value={pageSize}
                            onChange={e => {
                                setPageSize(Number(e.target.value))
                            }}
                        >
                            {[10, 20, 30, 40, 50].map(pageSize => (
                                <option key={pageSize} value={pageSize}>
                                    Show {pageSize}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </>
    )
}

// Define a default UI for filtering
function DefaultColumnFilter() {
    return ("")
}

// Define a custom filter filter function!
function filterGreaterThan(rows, id, filterValue) {
    return rows.filter(row => {
        const rowValue = row.values[id]
        return rowValue >= filterValue
    })
}

// This is an autoRemove method on the filter function that
// when given the new filter value and returns true, the filter
// will be automatically removed. Normally this is just an undefined
// check, but here, we want to remove the filter if it's not a number
filterGreaterThan.autoRemove = val => typeof val !== 'number'