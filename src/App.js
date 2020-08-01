import React, {
  useState,
  useEffect,
} from "react";

import keyBy from "lodash.keyby";
import dayjs from "dayjs";
import "dayjs/locale/en-au";
import relativeTime from "dayjs/plugin/relativeTime";


import all from "./data/overall";
import provinces from "./data/area";


import Fallback from "./fallback"

import FAQPage from "./FAQPage";
import DailyHistoryPage from "./DailyHistoryPage";
import NewsPage from "./NewsPage";
import InfoPage from "./InfoPage";
import Navbar from "./Navbar";
import HomePage from "./HomePage/HomePage";
import StatesPage from "./StatesPage";
import WorldPage from "./WorldPage";
import BlogPage from "./BlogPage/BlogPage";
import Blog from "./BlogPage/Blog";
import AboutUsPage from "./aboutUs/AboutUsPage";

import StateChart from "./DataVis/StateChart";

import "./App.css";

import DashboardConfig from "./DashboardConfig"

// routes
import { useRoutes, usePath } from 'hookrouter';

import ReactGA from "react-ga";

import Grid from "@material-ui/core/Grid";

import stateCaseData from "./data/stateCaseData";
import { Alert } from '@material-ui/lab';
import Header from './Header';
import SocialMediaShareModal from './socialMediaShare/SocialMediaShareModal';


dayjs.extend(relativeTime);
ReactGA.initialize("UA-160673543-1");

ReactGA.pageview(window.location.pathname + window.location.search);


const provincesByName = keyBy(provinces, "name");
const provincesByPinyin = keyBy(provinces, "pinyin");


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
  const routes = {
    "/": () => <HomePage province={province} overall={overall} myData={myData} area={area} data={data} setProvince={setProvince} gspace={gspace} />,
    "/info": () => <InfoPage columns={columns} gspace={gspace} />,
    "/news": () => <NewsPage province={province} gspace={gspace} />,
    "/faq": () => <FAQPage />,
    "/dailyHistory": () => <DailyHistoryPage />,
    "/world": () => <WorldPage />,
    "/state": () => <StatesPage />,

    // Remember to update these based on how many
    // cases there currently are in each state/territory!
    "/state/vic": () => <StateChart state="VIC" dataType={"status_active"} timePeriod={7} />,
    "/state/nsw": () => <StateChart state="NSW" dataType={"status_active"} timePeriod={7} />,
    "/state/qld": () => <StateChart state="QLD" dataType={"status_active"} timePeriod={14} />,
    "/state/act": () => <StateChart state="ACT" dataType={"total"} timePeriod={21} />,
    "/state/sa": () => <StateChart state="SA"  dataType={"total"} timePeriod={21} />,
    "/state/wa": () => <StateChart state="WA" dataType={"total"} timePeriod={21} />,
    "/state/nt": () => <StateChart state="NT" dataType={"total"} timePeriod={21} />,
    "/state/tas": () => <StateChart state="TAS" dataType={"status_active"} timePeriod={21} />,

    "/dashboard": () => <DashboardConfig province={province} myData={myData} overall={overall} inputData={data} setProvince={setProvince} area={area} />,
    "/blog": () => <Blog />,
    "/blog/:id": ({ id }) => <Blog id={id} />,
    "/blog/post/:id": ({ id }) => <BlogPage id={id} />,
    "/about-us": () => <AboutUsPage />
  };
  //
  // // The hook used to render the routes.
  const routeResult = useRoutes(routes);
  // const [urlPath, setUrlPath] = useState(window.location.pathname);
  const path = usePath()

  // if (path == "/dashboard") {
  //   require('./DashboardConfig.css');
  // }

  if (myData) {

    if (path == "/dashboard") {
      if (window.innerHeight > window.innerWidth) {
        return (
          <div style={{ maxHeight: window.innerHeight }}>
            <SocialMediaShareModal
              visible={showSocialMediaIcons}
              onCancel={() => setShowSocialMediaIcons(false)}
            />
            <Grid container spacing={gspace} justify="center" wrap="wrap">
              <Grid item xs={12} className="removePadding">
                <Header province={province} />
              </Grid>
              {routeResult}
            </Grid>
          </div >
        )
      }
      else {
        return (
          <div style={{ maxHeight: window.innerHeight }}>
            <SocialMediaShareModal
              visible={showSocialMediaIcons}
              onCancel={() => setShowSocialMediaIcons(false)}
            />
            <Grid container spacing={gspace} justify="center" wrap="wrap">
              {routeResult}
            </Grid>
          </div >

        )
      }
    }
    else {
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
            {window.location.href === "http://localhost:3008/" || window.location.href === "http://covid-19-au.com/" || window.location.href === "https://covid-19-au.com/" ?
              <Alert style={{ width: '100%' }} severity="info">
                {/*<AlertTitle><strong>Important!!</strong></AlertTitle>*/}
                {window.innerWidth > '576' ?
                  <p style={{ fontSize: "0.85rem" }} className="card-text">To improve our site, we are working
                  with researchers from Monash University and Rochester Institute of Technology, to
                  investigate how our users seek information about COVID-19. We would be very grateful, if
                              you could fill in this&nbsp;<a target="_blank" rel="noopener noreferrer"
                      href="https://docs.google.com/forms/d/e/1FAIpQLSdPMLY_4M6HVBCGbFqDVbfcoKcuM5fUeDpPR77Xc_nhBp9vZA/viewform?usp=sf_link"
                      onClick={() => ReactGA.event({
                        category: 'infoBar',
                        action: "survey"
                      })}><u><strong>10-min survey</strong></u></a>. <br />The
                              survey results will eventually be released at <a target="_blank" rel="noopener noreferrer"
                      href="https://covid19onlinesurvey.org"
                      onClick={() => ReactGA.event({
                        category: 'infoBar',
                        action: "visitSite"
                      })}><u>https://covid19onlinesurvey.org</u></a>
                  </p> : <p style={{ fontSize: "0.85rem" }} className="card-text">How do you seek COVID-19 information?
                              Please fill in this&nbsp;<a target="_blank" rel="noopener noreferrer"
                      href="https://docs.google.com/forms/d/e/1FAIpQLSdPMLY_4M6HVBCGbFqDVbfcoKcuM5fUeDpPR77Xc_nhBp9vZA/viewform?usp=sf_link"
                      onClick={() => ReactGA.event({
                        category: 'infoBar',
                        action: "survey"
                      })}><u><strong>10-min survey</strong></u></a>&nbsp;to help us improve this site. More details can be seen at <a target="_blank" rel="noopener noreferrer"
                        href="https://covid19onlinesurvey.org"
                        onClick={() => ReactGA.event({
                          category: 'infoBar',
                          action: "visitSite"
                        })}><u>covid19onlinesurvey.org</u>.</a>
                  </p>

                }
              </Alert> : <div />}
            <Grid item xs={12} className="removePadding">
              <Navbar setNav={setNav} nav={nav} />
              {/*<Navbar  province={province} overall={overall} myData={myData} area={area} data={data} setProvince={setProvince} gspace={gspace} columns={columns}/>*/}
            </Grid>
            {/*{nav === "Home" ? <HomePage province={province} overall={overall} myData={myData} area={area} data={data} setProvince={setProvince} gspace={gspace} /> : ""}*/}
            {/*{nav === "Info" ? <InfoPage nav={nav} columns={columns} gspace={gspace} /> : ""}*/}
            {/*{nav === "News" ? <NewsPage province={province} gspace={gspace} nav={nav} /> : ""}*/}
            {/*{nav === "About" ? <FAQPage /> : ""}*/}
            {/* routeResult renders the routes onto this area of the app function.
          E.g. if routeResult is moved to the navBar, the pages will render inside the navbar. */}
            {routeResult}
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
            <Grid item xs={12}>
              <Fallback setModalVisibility={setModalVisibility} setNav={setNav} nav={nav} />
            </Grid>
          </Grid>
        </div >

      );
    }
  }
  return null;
}

export default App;
