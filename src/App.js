import React, { useState, useEffect } from "react";
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { useRoutes, usePath } from 'hookrouter';
import ReactGA from "react-ga";
import Grid from "@material-ui/core/Grid";
import { Alert } from '@material-ui/lab';

import keyBy from "lodash.keyby";
import dayjs from "dayjs";
import "dayjs/locale/en-au";
import relativeTime from "dayjs/plugin/relativeTime";

import all from "./data/overall";
import provinces from "./data/area";

import Fallback from "./common/fallback"
import FAQPage from "./faq/FAQPage";
import DailyHistoryPage from "./daily_history/DailyHistoryPage";
import NewsPage from "./news/NewsPage";
import InfoPage from "./info/InfoPage";
import Navbar from "./common/Navbar";
import HomePage from "./home/HomePage";
import StatesPage from "./states/StatesPage";
import WorldPage from "./world/WorldPage";
import BlogPage from "./blog/BlogPage";
import Blog from "./blog/Blog";
import AboutUsPage from "./about_us/AboutUsPage";
import StateChart from "./common/data_vis/StateChart";
import DashboardConfig from "./dashboard/DashboardConfig"

import stateCaseData from "./data/stateCaseData";
import Header from './common/Header';
import SocialMediaShareModal from './common/social_media_share/SocialMediaShareModal';
import ColorManagement from "./common/color_management/ColorManagement";

// Include either dark or light css based on the saved settings
if (ColorManagement.getColorSchemeType() === ColorManagement.COLOR_SCHEME_LIGHT) {
  require("bootstrap-scss/bootstrap.scss");
  //require("bootswatch/dist/flatly/bootstrap.min.css");
} else {
  require("bootswatch/dist/darkly/bootstrap.min.css");
}
require("./App.css");


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

  // Set the routes for each page and pass in props.
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
    "/state/vic": () => <StateChart state="VIC"
                                    dataType={"status_active"}
                                    timePeriod={null} />,
    "/state/nsw": () => <StateChart state="NSW"
                                    dataType={"status_active"}
                                    timePeriod={null} />,
    "/state/qld": () => <StateChart state="QLD"
                                    dataType={"status_active"}
                                    timePeriod={null} />,
    "/state/act": () => <StateChart state="ACT"
                                    dataType={"total"}
                                    timePeriod={21} />,
    "/state/sa": () => <StateChart state="SA"
                                   dataType={"total"}
                                   timePeriod={21} />,
    "/state/wa": () => <StateChart state="WA"
                                   dataType={"total"}
                                   timePeriod={21} />,
    "/state/nt": () => <StateChart state="NT"
                                   dataType={"total"}
                                   timePeriod={21} />,
    "/state/tas": () => <StateChart state="TAS"
                                    dataType={"status_active"}
                                    timePeriod={null} />,

    "/dashboard": () => <DashboardConfig province={province} myData={myData} overall={overall} inputData={data} setProvince={setProvince} area={area} />,
    "/blog": () => <Blog />,
    "/blog/:id": ({ id }) => <Blog id={id} />,
    "/blog/post/:id": ({ id }) => <BlogPage id={id} />,
    "/about-us": () => <AboutUsPage />
  };

  // The hook used to render the routes.
  const routeResult = useRoutes(routes);
  const path = usePath()

  const prefersDarkMode =
      ColorManagement.getColorSchemeType() === ColorManagement.COLOR_SCHEME_DARK;
  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode],
  );

  if (myData) {
    if (path == "/dashboard") {
      if (window.innerHeight > window.innerWidth) {
        return (
          <ThemeProvider theme={theme}>
            <CssBaseline />
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
            </div>
          </ThemeProvider>
        )
      } else {
        return (
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <div style={{ maxHeight: window.innerHeight }}>
              <SocialMediaShareModal
                visible={showSocialMediaIcons}
                onCancel={() => setShowSocialMediaIcons(false)}
              />
              <Grid container spacing={gspace} justify="center" wrap="wrap">
                {routeResult}
              </Grid>
            </div>
          </ThemeProvider>
        )
      }
    } else {
      return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div className={prefersDarkMode ? 'dark' : 'light'}>
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
                    <p style={{ fontSize: "0.85rem" }} className="card-text">
                      Notice: <u>https://covid-19-au.com</u> is the only valid url of our website, others that linked to our website are not related to us.
                    </p>
                </Alert> : <div />}
              <Grid item xs={12} className="removePadding">
                <Navbar setNav={setNav} nav={nav} />
              </Grid>
              {routeResult}
              <Grid item xs={12}>
                <Fallback setModalVisibility={setModalVisibility} setNav={setNav} nav={nav} />
              </Grid>
            </Grid>
          </div>
        </ThemeProvider>
      );
    }
  }
  return null;
}

export default App;
