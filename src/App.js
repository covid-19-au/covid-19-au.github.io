import React, {
  useState,
  Suspense,
  useEffect,
  useRef
} from "react";
import keyBy from "lodash.keyby";
import dayjs from "dayjs";
import "dayjs/locale/en-au";
import relativeTime from "dayjs/plugin/relativeTime";

import flights from "./data/flight";
import country from "./data/country";
import testedCases from "./data/testedCases";
import all from "./data/overall";
import provinces from "./data/area";
import information from "./data/info";
import mapDataHos from "./data/mapdataHos";
import stateData from "./data/state";
import Tag from "./Tag";
import Fallback from "./fallback"
import Flights from "./Flights";
import StateGraph from "./StateGraph";
import FAQ from "./faq"
import MbMap from "./ConfirmedMap";
import "./App.css";
import uuid from "react-uuid";
import ReactPlayer from "react-player";

// routes
// import {useRoutes, A} from 'hookrouter';
// import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom';

import ReactGA from "react-ga";
import CanvasJSReact from "./assets/canvasjs.react";

import { TwitterTimelineEmbed } from "react-twitter-embed";

import Grid from "@material-ui/core/Grid";
import NewsTimeline from "./NewsTimeline";
import TopNews from "./TopNews";
import { useTable, useFilters, useGlobalFilter, usePagination } from 'react-table'

import stateCaseData from "./data/stateCaseData";
import SocialMediaShareModal from './socialMediaShare/SocialMediaShareModal';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Alert, AlertTitle } from '@material-ui/lab';

import dailyFun from "./data/dailyFun"

let CanvasJSChart = CanvasJSReact.CanvasJSChart;
dayjs.extend(relativeTime);
ReactGA.initialize("UA-160673543-1");

ReactGA.pageview(window.location.pathname + window.location.search);

const GoogleMap = React.lazy(() => import("./GoogleMap"));

const provincesByName = keyBy(provinces, "name");
const provincesByPinyin = keyBy(provinces, "pinyin");

function HistoryGraph({ countryData }) {
  let today = Date.now();
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState(null);
  const [newOpts, setNewOpts] = useState(null);
  useEffect(() => {
    let monthTrans = {
      0: "Jan",
      1: "Feb",
      2: "Mar",
      3: "Apr",
      4: "May",
      5: "Jun",
      6: "Jul",
      7: "Aug",
      8: "Sept",
      9: "Oct",
      10: "Nov",
      11: "Dec"
    };
    let historyData = [
      {
        type: "spline",
        name: "Confirmed",
        showInLegend: true,
        dataPoints: []
      },
      {
        type: "spline",
        name: "Deaths",
        showInLegend: true,
        dataPoints: []
      },
      {
        type: "spline",
        name: "Recovered",
        showInLegend: true,
        dataPoints: []
      }
    ];
    let newData = [
      {
        type: "stackedColumn",
        name: "New Cases",
        showInLegend: true,
        dataPoints: []
      },
      {
        type: "stackedColumn",
        name: "Deaths",
        showInLegend: true,
        dataPoints: []
      }
    ];
    let pre = [];
    for (let key in countryData) {
      let arr = key.split("-");
      let date = new Date(arr[0], arr[1] - 1, arr[2]);
      if ((today - date) / (1000 * 3600 * 24) <= 14) {
        let labelName = monthTrans[date.getMonth()] + " " + date.getDate().toString();
        historyData[0]["dataPoints"].push({
          y: countryData[key][0],
          label: labelName
        });
        historyData[1]["dataPoints"].push({
          y: countryData[key][2],
          label: labelName
        });
        historyData[2]["dataPoints"].push({
          y: countryData[key][1],
          label: labelName
        });
        newData[0]["dataPoints"].push({
          y: countryData[key][0] - pre[0],
          label: labelName
        });
        newData[1]["dataPoints"].push({
          y: countryData[key][2] - pre[2],
          label: labelName
        });
      }
      pre = countryData[key];
    }
    setOptions({
      animationEnabled: true,
      height: 314,
      title: {
        text: "Overall trends for COVID-19 cases in Australia ",
        fontFamily:
          "Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif",
        fontSize: 20
      },
      axisX: {
        labelFontFamily: "sans-serif"
      },
      axisY: {
        labelFontFamily: "sans-serif"
      },
      legend: {
        verticalAlign: "top",
        fontFamily: "sans-serif"
      },
      toolTip: {
        shared: true
        // content:"{label}, {name}: {y}" ,
      },
      colorSet: "sitePalette",

      data: historyData
    });
    setNewOpts({
      data: newData,
      animationEnabled: true,
      height: 315,
      title: {
        text: "Daily new cases and deaths in Australia",
        fontFamily:
          "Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif",
        fontSize: 20
      },
      axisX: {
        labelFontFamily: "sans-serif"
      },
      axisY: {
        labelFontFamily: "sans-serif"
      },
      legend: {
        verticalAlign: "top",
        fontFamily: "sans-serif"
      },
      toolTip: {
        shared: true
        // content:"{label}, {name}: {y}" ,
      },
      colorSet: "sitePalette"
    });


    setLoading(false);
  }, [countryData]);

  return loading ? (
    <div className="loading">Loading...</div>
  ) : (
      <div className="card">
        <h2>Historical Data</h2>
        <CanvasJSChart options={options} />
        <CanvasJSChart options={newOpts} />
      </div>
    );
}

function New({ title, contentSnippet, link, pubDate, pubDateStr }) {
  return (
    <div className="new">
      <div className="new-date">
        <div className="relative">
          {dayjs(pubDate)
            .locale("en-au")
            .fromNow()}
        </div>
        {dayjs(pubDate).format("YYYY-MM-DD HH:mm")}
      </div>
      <a href={link} className="title">
        {title}
      </a>
      <div className="summary">{contentSnippet.split("&nbsp;")[0]}...</div>
    </div>
  );
}

function News({ province }) {
  let Parser = require("rss-parser");

  const [len, setLen] = useState(3);
  const [news, setNews] = useState([]);

  useEffect(() => {
    let parser = new Parser({
      headers: { "Access-Control-Allow-Origin": "*" }
    });
    const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
    parser.parseURL(
      CORS_PROXY +
      "https://news.google.com/rss/search?q=COVID%2019-Australia&hl=en-US&gl=AU&ceid=AU:en",
      function (err, feed) {
        if (err) throw err;
        // console.log(feed.title);
        // feed.items.forEach(function(entry) {
        //     console.log(entry);
        // })
        setNews(feed.items);
      }
    );
  }, []);

  return (
    <div className="card">
      <h2>News Feed</h2>
      {news.slice(0, len).map(n => (
        <New {...n} key={n.id} />
      ))}
      <div
        className="more"
        onClick={() => {
          setLen(len + 2);
        }}
      >
        <i>
          <u>Click for more news...</u>
        </i>
      </div>
    </div>
  );
}

function Tweets({ province, nav }) {

  return (
    <div className="card">
      <h2>Twitter Feed</h2>
      <div className="centerContent">
        <div className="selfCenter standardWidth">
          {/* Must do check for window.location.pathname === "News" to ensure TwitterTimeLine doesn't do a react state update on an unmounted component. */}
          {nav === "News" ? (
            <TwitterTimelineEmbed
              sourceType="list"
              ownerScreenName="8ravoEchoNov"
              slug="COVID19-Australia"
              options={{
                height: 450
              }}
              noHeader={true}
              noFooter={true}
            />
          ) : (
              ""
            )}
        </div>
      </div>
    </div>
  );
}

function Stat({
  modifyTime,
  confirmedCount,
  suspectedCount,
  deadCount,
  curedCount,
  testedCount,
  name,
  quanguoTrendChart,
  hbFeiHbTrendChart,
  data,
  countryData
}) {
  let confCountIncrease = 0;
  let deadCountIncrease = 0;
  let curedCountIncrease = 0;
  let testedCountIncrease = 0;
  if (data && countryData) {
    confirmedCount = 0;
    testedCount = 0;
    deadCount = 0;
    curedCount = 0;
    for (let i = 0; i < data.length; i++) {
      confirmedCount += parseInt(data[i][1]);
      deadCount += parseInt(data[i][2]);
      curedCount += parseInt(data[i][3]);

      if (data[i][4] == "N/A") {
        //do nothing
      }
      else {
        testedCount += parseInt(data[i][4]);
      }

    }
    let lastTotal =
      countryData[
      Object.keys(countryData)[Object.keys(countryData).length - 1]
      ];
    confCountIncrease = confirmedCount - lastTotal[0];
    deadCountIncrease = deadCount - lastTotal[2];
    curedCountIncrease = curedCount - lastTotal[1];
    testedCountIncrease = testedCount - lastTotal[3]
  } else {
    confirmedCount = 0;
    deadCount = 0;
    curedCount = 0;
    testedCount = 0;
  }

  return (
    <div className="card">

      <h2 style={{ display: "flex" }}>Status {name ? `· ${name}` : false}
        <div style={{ alignSelf: "flex-end", marginLeft: "auto", fontSize: "60%" }}>
          <a
            style={{
              display: "inline-flex"
            }}
            className="badge badge-light"
            target="_blank" rel="noopener noreferrer"
            href="https://github.com/covid-19-au/covid-19-au.github.io/blob/dev/reference/reference.md"
          >
            <svg className="bi bi-question-circle" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor"
              xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm0 1A8 8 0 108 0a8 8 0 000 16z"
                clipRule="evenodd" />
              <path
                d="M5.25 6.033h1.32c0-.781.458-1.384 1.36-1.384.685 0 1.313.343 1.313 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.007.463h1.307v-.355c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.326 0-2.786.647-2.754 2.533zm1.562 5.516c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z" />
            </svg>
            <div className="dataSource">Data Source</div>
          </a></div>

      </h2>



      <div className="row">

        <Tag
          number={confirmedCount}
          fColor={"#ff603c"}
          increased={confCountIncrease}
        >
          <button className="hoverButton" data-toggle="tooltip" data-placement="bottom" data-html="true"
            title="<em>All confirmed cases of COVID-19 so far, including deaths and recoveries.</em>">
            Confirmed</button>

        </Tag>
        {/*<Tag number={suspectedCount || '-'}>*/}
        {/*疑似*/}
        {/*</Tag>*/}
        <Tag
          number={deadCount}
          fColor={"#c11700"}
          increased={deadCountIncrease}
        >
          <button className="hoverButton" data-toggle="tooltip" data-placement="bottom" data-html="true"
            title="<em>All confirmed deaths due to COVID-19, including 1 from the Diamond Princess cruise ship.</em>">
            Deaths</button>

        </Tag>
      </div>
      <div className="row">
        <Tag
          number={curedCount}
          fColor={"#00c177"}
          increased={curedCountIncrease}
        >
          <button className="hoverButton" data-toggle="tooltip" data-placement="bottom" data-html="true"
            title="<em>Number of people that have recovered from COVID-19.</em>">
            Recovered</button>

        </Tag>
        <Tag
          number={testedCount}
          fColor={"#007cf2"}
          increased={testedCountIncrease}
        >
          <button className="hoverButton" data-toggle="tooltip" data-placement="bottom" data-html="true"
            title="<em>Number of people that have recovered from COVID-19.</em>">
            Tested</button>

        </Tag>


      </div>
      <span className="due" style={{ fontSize: "80%", paddingTop: 0 }}>
        Time in AEDT, last updated at: {stateCaseData.updatedTime}
      </span>

      {/*<div>*/}
      {/*<img width="100%" src={quanguoTrendChart[0].imgUrl} alt="" />*/}
      {/*</div>*/}
      {/*<div>*/}
      {/*<img width="100%" src={hbFeiHbTrendChart[0].imgUrl} alt="" />*/}
      {/*</div>*/}
    </div>
  );
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function Area({ area, onChange, data }) {
  let totalRecovered = 0;
  for (let i = 0; i < data.length; i++) {
    totalRecovered += parseInt(data[i][3]);
  }
  let lastTotal =
    stateData[
    Object.keys(stateData)[Object.keys(stateData).length - 1]
    ];

  const getAriaLabel = (state, confirmed, death, recovered, tested) => {
    return `In ${state.split("").join(" ")}, there were ${confirmed} confirmed cases. Out of them, ${death} unfortunately resulted in death.

    ${recovered} recovered and ${tested} were tested`;
  };

  const renderArea = () => {
    let latest =
      testedCases[
      Object.keys(testedCases)[Object.keys(testedCases).length - 1]
      ];

    return data.map(x => (
      <div role={"button"} aria-label={getAriaLabel(...x)} aria-describedby={getAriaLabel(...x)} className="province" key={uuid()}>
        {/*<div className={`area ${x.name ? 'active' : ''}`}>*/}
        {/*{ x.name || x.cityName }*/}
        {/*</div>*/}
        {/*<div className="confirmed">{ x.confirmedCount }</div>*/}
        {/*<div className="death">{ x.deadCount }</div>*/}
        {/*<div className="cured">{ x.curedCount }</div>*/}
        <div className={"area"}>
          <strong>{x[0]}</strong>
        </div>
        <div className="confirmed">
          <strong>{numberWithCommas(x[1])}</strong>&nbsp;<div className="dailyIncrease">{(x[1] - lastTotal[x[0]][0]) > 0 ? `(+${x[1] - lastTotal[x[0]][0]})` : null}</div>
        </div>
        <div className="death">
          <strong>{numberWithCommas(x[2])}</strong>&nbsp;<div className="dailyIncrease">{(x[2] - lastTotal[x[0]][1]) > 0 ? ` (+${x[2] - lastTotal[x[0]][1]})` : null}</div>
        </div>
        <div className="cured">
          <strong>{numberWithCommas(x[3])}</strong>&nbsp;<div className="dailyIncrease">{(x[3] - lastTotal[x[0]][2]) > 0 ? `(+${x[3] - lastTotal[x[0]][2]})` : null}</div>
        </div>
        <div className="tested">{numberWithCommas(x[4])}</div>
      </div>
    ));
  };

  return (
    <div role={"table"}>
      <div className="province header">
        <div className="area header statetitle">State</div>
        <div className="confirmed header confirmedtitle">Confirmed</div>
        <div className="death header deathtitle">Deaths</div>
        <div className="cured header recoveredtitle">Recovered</div>
        <div className="tested header testedtitle">Tested</div>
      </div>
      {renderArea()}

      {totalRecovered > 25 ? null : (
        <div className="province">
          <div className={"area"}>
            <strong>TBD</strong>
          </div>
          <div className="confirmed">
            <strong></strong>
          </div>
          <div className="death">
            <strong></strong>
          </div>
          <div className="cured">
            <strong>21</strong>
          </div>
          <div className="tested"></div>
        </div>
      )}
    </div>
  );
}

function Header({ province }) {
  return (
    <header>
      <div className="bg"></div>
      <h1
        style={{
          fontSize: "120%",
          color: "white",
          textAlign: "center"
        }}
      >
        COVID-19 in Australia — Real-Time Report
      </h1>
      {/*<i>By Students from Monash</i>*/}
    </header>
  );
}

function Navbar({ setNav, nav }) {
  // const [nav, setNav] = useState("Home");
  const [isSticky, setSticky] = useState(false);
  const ref = useRef(null);
  const handleScroll = () => {
    setSticky(ref.current.getBoundingClientRect().top <= 0);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", () => handleScroll);
    };
  }, []);

  const onClick = e => {
    setNav(e.target.innerText);
    window.scrollTo(0, 0);
  }

  return (
    <div className={`sticky-wrapper ${isSticky ? "sticky" : ""}`} ref={ref}>
      <div
        className={`row sticky-inner ${isSticky ? "navBarStuck" : "navBar"}`}
      >
        <span
          className={`navItems ${
            nav === "Home" && !isSticky ? "navCurrentPage " : ""
            } ${nav === "Home" && isSticky ? "navCurrentPageSticky" : ""} `}
          onClick={onClick}
        >
          <strong>Home</strong>
        </span>
        <span
          className={`navItems ${
            nav === "Info" && !isSticky ? "navCurrentPage " : ""
            } ${nav === "Info" && isSticky ? "navCurrentPageSticky" : ""} `}
          onClick={onClick}
        >
          <strong>Info</strong>
        </span>
        <span
          className={`navItems ${
            nav === "News" && !isSticky ? "navCurrentPage " : ""
            } ${nav === "News" && isSticky ? "navCurrentPageSticky" : ""} `}
          onClick={onClick}
        >
          <strong>News</strong>
        </span>
        {/*<A className={`navItems ${window.location.pathname === "/" && !isSticky ? "navCurrentPage " : ""} ${window.location.pathname === "/" && isSticky ? "navCurrentPageSticky" : ""} `} onClick={onClick} href="/"><strong>Home</strong></A>*/}
        {/*<A className={`navItems ${window.location.pathname === "/info" && !isSticky ? "navCurrentPage " : ""} ${window.location.pathname === "/info" && isSticky ? "navCurrentPageSticky" : ""} `} onClick={onClick} href="/info"><strong>Info</strong></A>*/}
        {/*<A className={`navItems ${window.location.pathname === "/news" && !isSticky ? "navCurrentPage " : ""} ${window.location.pathname === "/news" && isSticky ? "navCurrentPageSticky" : ""} `} onClick={onClick} href="/news"><strong>News</strong></A>*/}

        {/*<Link to="/">*/}
        {/*<span className={`navItems ${window.location.pathname === '/' && !isSticky ? "navCurrentPage " : ""} ${window.location.pathname === '/' && isSticky ? "navCurrentPageSticky" : ""} `} onClick={onClick}><strong>Home</strong></span>*/}
        {/*</Link>*/}
        {/*<Link to="/info">*/}
        {/*<span className={`navItems ${window.location.pathname === '/info' && !isSticky ? "navCurrentPage " : ""} ${window.location.pathname === '/info' && isSticky ? "navCurrentPageSticky" : ""} `} onClick={onClick}><strong>Info</strong></span>*/}
        {/*</Link>*/}
        {/*<Link to="/news">*/}
        {/*<span className={`navItems ${window.location.pathname === '/news' && !isSticky ? "navCurrentPage " : ""} ${window.location.pathname === '/news' && isSticky ? "navCurrentPageSticky" : ""} `} onClick={onClick}><strong>News</strong></span>*/}
        {/*</Link>*/}

      </div>
    </div>
  );
}

function Information({ hospitalData, columns }) {
  return (
    <div>
      <div className="card">
        <h2 className="responsiveH2">Daily Fun Stuff</h2>

        {dailyFun.dailyFunStuff.map(stuff => (
          <div key={uuid()}>
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
                          src={i1.link}
                          alt={i1.name}
                          style={{}}
                        />
                        <small className="mediaText">{i1.description}</small>
                      </div>
                    </div>

                  </div>
                ))}
                {/* Video */}
                {stuff.video.map(vid => (
                  <div className="row centerMedia">
                    <div>
                      <ReactPlayer alt={vid.name} className="formatMedia" url={vid.link} controls={true} config={{ youtube: { playerVars: { showinfo: 1 } } }} />
                      <small className="mediaText">{vid.description}</small>
                    </div>
                  </div>
                ))}

              </div>
            </div>
          </div>
        ))
        }
        <p style={{ textAlign: "center" }}>We will be regularly sharing fun and interesting things in this section as we believe it is good to spread some positivity in times like these!</p>

        <p style={{ textAlign: "center" }}>If you have something that you would like us to share, you can submit it <a style={{ color: "#3366BB" }} target="_blank"
          rel="noopener noreferrer" href="https://docs.google.com/forms/d/e/1FAIpQLScPl8U9tILO2wD1xbtkz1pDTW0wBcAlcIb3cnJvnvUahAZEuw/viewform?usp=sf_link">{"here!"}</a> </p>
      </div>


      <div className="card" >
        <h2 className="responsiveH2">Informative Media</h2>
        <div className="row centerMedia">
          <div>
            <ReactPlayer alt="Coronavirus explained and how to protect yourself from COVID-19" className="formatMedia" url="http://www.youtube.com/watch?v=BtN-goy9VOY" controls={true} config={{ youtube: { playerVars: { showinfo: 1 } } }} />
            <small className="mediaText">The Coronavirus explained and what you should do.</small>
          </div>
        </div>

        <div className="row centerMedia">
          <div>
            <ReactPlayer alt="How to wash hands - Coronavirus / COVID-19" className="formatMedia" url="https://vp.nyt.com/video/2020/03/12/85578_1_HowToWashYourHands_wg_1080p.mp4" playing={true} loop={true} />
            <small className="mediaText">How to properly wash your hands.</small> <br />
            <small style={{ color: "#3366BB" }}><a target="_blank"
              rel="noopener noreferrer"
              href={"https://i.dailymail.co.uk/1s/2020/03/03/02/25459132-8067781-image-a-36_1583202968115.jpg"}>{"Here's a step-by-step guide you can save"}</a></small>
          </div>
        </div>

        <div className="row centerMedia">
          <div>
            <ReactPlayer alt="How to wear a mask - Coronavirus / COVID-19" className="formatMedia" url="https://www.youtube.com/watch?time_continue=107&v=lrvFrH_npQI&feature=emb_title" controls={true} />
            <small className="mediaText">How to properly wear and dispose of masks.</small>
          </div>
        </div>
      </div>
      <div className="card" >


        <h2 className="responsiveH2">General Information</h2>
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
                    {info.text.citation.map(cit => (
                      <small key={uuid()}><a className="citationLink" target="_blank" rel="noopener noreferrer" href={cit.link}>{cit.name}</a></small>
                    ))}
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
            </div>
          </div>
        ))
        }</div>
      <div className="card" >
        <h2 className="responsiveH2">Current Regulations</h2>
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
                    {info.text.citation.map(cit => (
                      <small key={uuid()}><a className="citationLink" target="_blank" rel="noopener noreferrer" href={cit.link}>{cit.name}</a></small>
                    ))}
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
            </div>
          </div>
        ))
        }</div>
      <div className="card" >
        <h2 className="responsiveH2">Think you have COVID-19?</h2>
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

                    {/* Citation tag */}
                    {info.text.citation.map(cit => (
                      <small key={uuid()}><a className="citationLink" target="_blank" rel="noopener noreferrer" href={cit.link}>{cit.name}</a></small>
                    ))}
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
            </div>
          </div>
        ))
        }</div>
      <div className="card" >
        <h2 className="responsiveH2">Protecting Yourself and Others</h2>

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
                    {info.text.citation.map(cit => (
                      <small key={uuid()}><a className="citationLink" target="_blank" rel="noopener noreferrer" href={cit.link}>{cit.name}</a></small>
                    ))}
                    {/* Video */}
                    {info.video_1.map(vid => (
                      <div className="row centerMedia" key={uuid()}>
                        <div>
                          <ReactPlayer alt="Coronavirus explained and how to protect yourself from COVID-19"
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
      <div className="card" >
        <h2 className="responsiveH2">Coronavirus Helplines</h2>
        <div className="row alignStyles responsiveText">
          <div>
            <h3>National helplines operating 24 hours a day, seven days a week.</h3>
            <ul>
              <li>For information on coronavirus (COVID-19) at the National Helpline: <a className="citationLink" href="tel:1800020080">1800 020 080</a></li>
              <li>If you are feeling unwell, call Healthdirect: <a className="citationLink" href="tel:1800022222">1800 022 222</a></li>
            </ul>
            <h3>Some states have dedicated helplines aswell: </h3>
            <ul>
              <li>Victoria: <a className="citationLink" href="tel:1800675398">1800 675 398</a></li>
              <li>Queensland: <a className="citationLink" href="tel:13432584">13 43 25 84</a></li>
              <li>Northern Territory: <a className="citationLink" href="tel:1800008002">1800 008 002</a>
                <p>-  If you are in Darwin and need to arrange testing call the Public Health Unit on: <a className="citationLink" href="tel:89228044">8922 8044</a></p>
              </li>
              <li>Tasmania: <a className="citationLink" href="tel:1800671738">1800 671 738</a>
                <p>-  If you need an interpreter, phone the Tasmanian Interpreting Service (TIS) on <a className="citationLink" href="tel:131450">131 450</a> and tell them your language.</p>
                <p>-  Tell the interpreter your name and that you’re calling the Tasmanian Department of Health <a className="citationLink" href="tel:1800671738" >1800 671 738</a>.</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="card" >
        <h2 className="responsiveH2">Other interesting links to learn about the current situation</h2>
        <div className="row alignStyles responsiveText">
          <div>
            <ul>
              <li><a className="citationLink" target="_blank" rel="noopener noreferrer" href="https://medium.com/@tomaspueyo/coronavirus-the-hammer-and-the-dance-be9337092b56">Coronavirus: The Hammer and the Dance</a></li>
              <li><a className="citationLink" target="_blank" rel="noopener noreferrer" href="https://www.nytimes.com/news-event/coronavirus">The New York Times</a> and the <a className="citationLink" target="_blank" rel="noopener noreferrer" href="https://www.economist.com/news/2020/03/11/the-economists-coverage-of-the-coronavirus">Economist</a> are giving people free access to their coronavirus coverage. It's really good!</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="card" >
        <h2 className="responsiveH2">List of Hospitals doing Coronavirus testing</h2>
        <p className="responsiveText"><strong>Note: </strong>For anyone in Tasmania, all four testing clinics will not be open for walk-up testing, and anyone who thinks they may need testing should first contact the Public Health Hotline on <a className="citationLink" href="tel:1800671738">1800 671 738</a></p>
        <small>Filter the table by clicking the dropdown below state.</small>
        <div className="row centerMedia">
          <div>
            <Table className="formatMedia" columns={columns} data={hospitalData} />
          </div>
        </div>
      </div >
    </div>
  );
}

function HomePage({
  province,
  overall,
  myData,
  area,
  data,
  setProvince,
  gspace
}) {
  return (
    <Grid container spacing={gspace} justify="center" wrap="wrap">
      <Grid item xs={11} sm={11} md={10} lg={6} xl={4}>
        <Stat
          {...{ ...all, ...overall }}
          name={province && province.name}
          data={myData}
          countryData={country}
        />
        <div className="card" >
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <GoogleMap
              province={province}
              data={data}
              onClick={name => {
                const p = provincesByName[name];
                if (p) {
                  setProvince(p);
                }
              }}
              newData={myData}
            />
            <Area area={area} onChange={setProvince} data={myData} />
          </Suspense>
        </div>
      </Grid>

      <Grid item xs={11} sm={11} md={10} lg={6} xl={4}>
        <MbMap />
        <HistoryGraph countryData={country} />
      </Grid>
      <Grid item xs={11} sm={11} md={10} lg={6} xl={4}>
        <StateGraph stateData={stateData} />
      </Grid>

      <Grid item xs={11} sm={11} md={10} lg={6} xl={4}>
        <Flights flights={flights} />
      </Grid>


    </Grid>
  );
}

function FAQPage() {
  return (
    <Grid item xs={11} sm={11} md={10}>
      <FAQ />
    </Grid>
  )
}

// Info page to present information about the virus.
function InfoPage({ columns }) {

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
      <Information columns={columns} hospitalData={hospitalData} />
    </Grid>
  )
}

// News page showing a News Timeline and Twitter Feed
function NewsPage({ gspace, province, nav }) {
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


// Define a default UI for filtering
function DefaultColumnFilter() {
  return ("")
}

// This is a custom filter UI for selecting
// a unique option from a list
function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
}) {
  // Calculate the options for filtering
  // using the preFilteredRows
  const options = React.useMemo(() => {
    const options = new Set()
    preFilteredRows.forEach(row => {
      options.add(row.values[id])
    })
    return [...options.values()]
  }, [id, preFilteredRows])

  // Render a multi-select box
  return (
    <select
      className="customStateSelect"
      value={filterValue}
      onChange={e => {
        setFilter(e.target.value || undefined)
      }}
    >
      <option style={{ textAlign: "center" }} value="">All</option>
      {options.map((option, i) => (
        <option key={i} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
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

function App() {
  const columns = React.useMemo(
    () => [
      {
        Header: 'Hospital',
        accessor: 'name'
      },
      {
        Header: 'Address',
        accessor: 'address'
      },
      {
        Header: 'Phone',
        accessor: 'hospitalPhone'
      },
      {
        Header: 'State',
        accessor: 'state',
        Filter: SelectColumnFilter,
        filter: 'includes'
      }
    ],
    []
  )

  const [province, _setProvince] = useState(null);
  const setProvinceByUrl = () => {
    const p = window.location.pathname.slice(1);
    _setProvince(p ? provincesByPinyin[p] : null);
  };

  useEffect(() => {
    setProvinceByUrl();
    window.addEventListener("popstate", setProvinceByUrl);
    return () => {
      window.removeEventListener("popstate", setProvinceByUrl);
    };
  }, []);

  const [gspace, _setGspace] = useState(0);
  const setGspace = () => {
    const p = window.innerWidth;
    _setGspace(p > 1280 ? 2 : 0);
  };

  useEffect(() => {
    setGspace();
    window.addEventListener("resize", setGspace);
    return () => {
      window.removeEventListener("resize", setGspace);
    };
  }, []);

  const [myData, setMyData] = useState(null);
  useEffect(() => {
    let sortedData = stateCaseData.values.sort((a, b) => {
      return b[1] - a[1];
    });
    setMyData(sortedData);
  }, [province]);
  useEffect(() => {
    if (province) {
      window.document.title = `Covid-19 Live Status | ${province.name}`;
    }
  }, [province]);

  const setProvince = p => {
    _setProvince(p);
    window.history.pushState(null, null, p ? p.pinyin : "/");
  };

  const data = !province
    ? provinces.map(p => ({
      name: p.provinceShortName,
      value: p.confirmedCount
    }))
    : provincesByName[province.name].cities.map(city => ({
      name: city.fullCityName,
      value: city.confirmedCount
    }));

  const area = province ? provincesByName[province.name].cities : provinces;
  const overall = province ? province : all;
  const [nav, setNav] = useState("Home");
  // This is used to set the state of the page for navbar CSS styling.
  const [showSocialMediaIcons, setShowSocialMediaIcons] = useState(false);

  const setModalVisibility = state => {
    setShowSocialMediaIcons(state);
  };
  // // Set the routes for each page and pass in props.
  // const routes = {
  //     "/": () => <HomePage province={province} overall={overall} myData={myData} area={area} data={data} setProvince={setProvince} gspace={gspace}/>,
  //     "/info": () => <InfoPage  columns={columns} gspace={gspace}/>,
  //     "/news": () => <NewsPage province={province} gspace={gspace} />,
  //     "/faq": () => <FAQPage />
  // };
  //
  // // The hook used to render the routes.
  // const routeResult = useRoutes(routes);
  // const [urlPath, setUrlPath] = useState(window.location.pathname);
  if (myData) {
    return (

      <div>
        <SocialMediaShareModal
          visible={showSocialMediaIcons}
          onCancel={() => setShowSocialMediaIcons(false)}
        />
        <Grid container spacing={gspace} justify="center" wrap="wrap">
          <Grid item xs={12} className="removePadding">
            <Header province={province} />
          </Grid>
          <Grid item xs={11} className="removePadding">
            <Navbar setNav={setNav} nav={nav} />
            {/*<Navbar  province={province} overall={overall} myData={myData} area={area} data={data} setProvince={setProvince} gspace={gspace} columns={columns}/>*/}
          </Grid>
          {nav === "Home" ? <HomePage province={province} overall={overall} myData={myData} area={area} data={data} setProvince={setProvince} gspace={gspace} /> : ""}
          {nav === "Info" ? <InfoPage nav={nav} columns={columns} gspace={gspace} /> : ""}
          {nav === "News" ? <NewsPage province={province} gspace={gspace} nav={nav} /> : ""}
          {nav === "About" ? <FAQPage /> : ""}
          {/* routeResult renders the routes onto this area of the app function.
          E.g. if routeResult is moved to the navBar, the pages will render inside the navbar. */}
          {/*{routeResult}*/}
          {/*<Switch>*/}
          {/*<Route path="/" render={() => (*/}
          {/*<HomePage province={province} overall={overall} myData={myData} area={area} data={data} setProvince={setProvince} gspace={gspace} />*/}
          {/*)} exact/>*/}
          {/*<Route path="/info" render={() => (*/}
          {/*<InfoPage columns={columns} />*/}
          {/*)} exact/>*/}
          {/*<Route path="/news" render={() => (*/}
          {/*<NewsPage province={province} gspace={gspace}/>*/}
          {/*)} exact/>*/}
          {/*<Route path="/faq" component={FAQPage} exact/>*/}
          {/*</Switch>*/}
          <Grid item xs={11}>
            <Fallback setModalVisibility={setModalVisibility} setNav={setNav} nav={nav} />
          </Grid>
        </Grid>
      </div>

    );
  }
  return null;
}

export default App;
