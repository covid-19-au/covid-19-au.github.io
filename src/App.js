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


import all from "./data/overall";
import provinces from "./data/area";
import information from "./data/info";
import mapDataHos from "./data/mapdataHos";


import Fallback from "./fallback"

import FAQPage from "./FAQPage";
import NewsPage from "./NewsPage";
import InfoPage from "./InfoPage";
import Navbar from "./Navbar";
import HomePage from "./HomePage/HomePage"

import "./App.css";
import uuid from "react-uuid";
import ReactPlayer from "react-player";

// routes
import { useRoutes, A } from 'hookrouter';
// import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom';

import ReactGA from "react-ga";


import { TwitterTimelineEmbed } from "react-twitter-embed";

import Grid from "@material-ui/core/Grid";
import NewsTimeline from "./NewsTimeline";
import { useTable, useFilters, useGlobalFilter, usePagination } from 'react-table'

import stateCaseData from "./data/stateCaseData";
import SocialMediaShareModal from './socialMediaShare/SocialMediaShareModal';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Alert, AlertTitle } from '@material-ui/lab';



dayjs.extend(relativeTime);
ReactGA.initialize("UA-160673543-1");

ReactGA.pageview(window.location.pathname + window.location.search);


const provincesByName = keyBy(provinces, "name");
const provincesByPinyin = keyBy(provinces, "pinyin");


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
        <div className="slogan"><i>Stay Calm Stay Informed</i></div>
      {/*<i>By Students from Monash</i>*/}
    </header>
  );
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
    "/faq": () => <FAQPage />
  };
  //
  // // The hook used to render the routes.
  const routeResult = useRoutes(routes);
  // const [urlPath, setUrlPath] = useState(window.location.pathname);
  if (myData) {
    return (

      <div>
        <SocialMediaShareModal
          visible={showSocialMediaIcons}
          onCancel={ () => setShowSocialMediaIcons(false)}
        />
        <Grid container spacing={gspace} justify="center" wrap="wrap">
          <Grid item xs={12} className="removePadding">
            <Header province={province} />
          </Grid>
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
