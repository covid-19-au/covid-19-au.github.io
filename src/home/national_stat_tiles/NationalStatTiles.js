import React from "react";
import Tag from "../../common/tag/Tag";
import stateCaseData from "../../data/stateCaseData.json";

// import i18n bundle
import i18next from "../../assets/translations/i18n";
import Grid from "@material-ui/core/Grid";
import UpdatesToday from "./UpdatesToday";

/**
 * Method for adding suffix to date
 * @param {int} i date
 */
function ordinal_suffix_of(i) {
  let j = i % 10,
      k = i % 100;

  if (j === 1 && k !== 11) {
    return i + "st";
  } else if (j === 2 && k !== 12) {
    return i + "nd";
  } else if (j === 3 && k !== 13) {
    return i + "rd";
  }

  return i + "th";
}

/**
 * Method for formatting time into am/pm format
 * @param {Date} date date
 */
function formatAMPM(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? "pm" : "am";

  hours = hours % 12;
  // the hour '0' should be '12'
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? "0" + minutes : minutes;

  return hours + " " + minutes + " " + ampm;
}

/**
 * Method for adding aria label to datetime of status update
 * @param {String} updatedTime update time for status information
 */
function getAriaLabelForUpdatedTime(updatedTime) {
  var timeElem = updatedTime.split(" ")[0].split(":");

  var dateElem = [];
  if (updatedTime.split(" ")[1].includes("/")) {
    dateElem = updatedTime.split(" ")[1].split("/");
  } else if (updatedTime.split(" ")[1].includes("-")) {
    dateElem = updatedTime.split(" ")[1].split("-");
  }

  var tempDate = new Date(dateElem[2], dateElem[1], dateElem[0], timeElem[0], timeElem[1]);
  const month = tempDate.toLocaleString("default", { month: "long" });
  return `Time in AEST, last updated at: ${ordinal_suffix_of(
    tempDate.getDate()
  )} of ${month} ${tempDate.getFullYear()} at ${formatAMPM(tempDate)}`;
}


export default function NationalStatTiles({
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
  countryData,
  activeCount,
  vaccineCount,
  hospitalCount,
  icuCount,
}) {
  let confCountIncrease = 0;
  let deadCountIncrease = 0;
  let curedCountIncrease = 0;
  let testedCountIncrease = 0;
  let activeCountIncrease = 0;
  let vaccineCountIncrease = 0;
  let hospitalCountIncrease = 0;
  let icuCountIncrease = 0;
  if (data && countryData) {
    confirmedCount = 0;
    testedCount = 0;
    deadCount = 0;
    curedCount = 0;
    activeCount = 0;
    hospitalCount = 0;
    vaccineCount = 0;
    icuCount = 0;
    for (let i = 0; i < data.length; i++) {
      confirmedCount += parseInt(data[i][1]);
      deadCount += parseInt(data[i][2]);
      curedCount += parseInt(data[i][3]);
      activeCount += parseInt(data[i][5]);
      hospitalCount += parseInt(data[i][6]);
      icuCount += parseInt(data[i][7]);
      vaccineCount += parseInt(data[i][10])

      if (data[i][4] === "N/A") {
        //do nothing
      } else {
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
    testedCountIncrease = testedCount - lastTotal[4];
    activeCountIncrease = activeCount - lastTotal[3];
    hospitalCountIncrease = hospitalCount - lastTotal[5];
    icuCountIncrease = icuCount - lastTotal[6];
    vaccineCountIncrease = vaccineCount - lastTotal[7];
  } else {
    confirmedCount = 0;
    deadCount = 0;
    curedCount = 0;
    testedCount = 0;
    activeCount = 0;
    hospitalCount = 0;
    icuCount = 0;
    vaccineCount = 0
  }

  return (
    <div>
      <Grid
        container
        spacing={1}
        justify="center"
        wrap="wrap"
        style={{ padding: "5px" }}
      >
        <Grid item xs={6} sm={3} lg={3} xl={3}>
          <Tag
            number={confirmedCount}
            fColor={"#ff603c"}
            increased={confCountIncrease}
            typeOfCases={"Confirmed"}
          >
            <button
              className="hoverButton"
              data-toggle="tooltip"
              data-placement="bottom"
              data-html="true"
              title="<em>All confirmed cases of COVID-19 so far, including deaths and recoveries.</em>"
            >
              {i18next.t("homePage:status.confirm")}
            </button>
          </Tag>
        </Grid>
        <Grid item xs={6} sm={3} lg={3} xl={3} style={{ width: "50px" }}>
          {/*<Tag number={suspectedCount || '-'}>*/}
          {/*疑似*/}
          {/*</Tag>*/}
          <Tag
            number={deadCount}
            fColor={"#c11700"}
            increased={deadCountIncrease}
            typeOfCases={"Deaths"}
          >
            <button
              className="hoverButton"
              data-toggle="tooltip"
              data-placement="bottom"
              data-html="true"
              title="<em>All confirmed deaths due to COVID-19, including 1 from the Diamond Princess cruise ship.</em>"
            >
              {i18next.t("homePage:status.Deaths")}
            </button>
          </Tag>
        </Grid>
        <Grid item xs={6} sm={3} lg={3} xl={3}>
          <Tag
            number={curedCount}
            fColor={"#00c117"}
            increased={curedCountIncrease}
            typeOfCases={"Recovered"}
          >
            <button
              className="hoverButton"
              data-toggle="tooltip"
              data-placement="bottom"
              data-html="true"
              title="<em>Number of people that have recovered from COVID-19.</em>"
            >
              {i18next.t("homePage:status.Recoveries")}
            </button>
          </Tag>
        </Grid>
        <Grid item xs={6} sm={3} lg={3} xl={3}>
          <Tag
              number={activeCount}
              fColor={"#f75c8d"}
              increased={activeCountIncrease}
              typeOfCases={"Active Cases"}
          >
            <button
                className="hoverButton"
                data-toggle="tooltip"
                data-placement="bottom"
                data-html="true"
                title="<em>Existing confirmed cases that have not yet recovered.</em>"
            >
              {i18next.t("homePage:status.active")}
            </button>
          </Tag>
        </Grid>

        <Grid item xs={6} sm={3} lg={3} xl={3}>
          <Tag
              number={vaccineCount}
              fColor={"#4ac100"}
              increased={vaccineCountIncrease}
              typeOfCases={"Vaccination"}
          >
            <button
                className="hoverButton"
                data-toggle="tooltip"
                data-placement="bottom"
                data-html="true"
                title="<em>Number of doses get injected.</em>"
            >
              {i18next.t("homePage:status.vaccination")}
            </button>
          </Tag>
        </Grid>

        <Grid item xs={6} sm={3} lg={3} xl={3}>
          <Tag
            number={testedCount}
            fColor={"#007cf2"}
            increased={testedCountIncrease}
            typeOfCases={"Tested"}
          >
            <button
              className="hoverButton"
              data-toggle="tooltip"
              data-placement="bottom"
              data-html="true"
              title="<em>Number of people that have been tested for COVID-19.</em>"
            >
              {i18next.t("homePage:status.Tested")}
            </button>
          </Tag>
        </Grid>

        <Grid item xs={6} sm={3} lg={3} xl={3}>
          <Tag
            number={hospitalCount}
            fColor={"#9d71ea"}
            increased={hospitalCountIncrease}
            typeOfCases={"In Hospital"}
          >
            <button
              className="hoverButton"
              data-toggle="tooltip"
              data-placement="bottom"
              data-html="true"
              title="<em>Number of people in hospital with COVID-19.</em>"
            >
              {i18next.t("homePage:status.hospital")}
            </button>
          </Tag>
        </Grid>
        <Grid item xs={6} sm={3} lg={3} xl={3}>
          <Tag
            number={icuCount}
            fColor={"#00aac1"}
            increased={icuCountIncrease}
            typeOfCases={"In ICU"}
          >
            <button
              className="hoverButton"
              data-toggle="tooltip"
              data-placement="bottom"
              data-html="true"
              title="<em>Number of people with COVID-19 in intensive care.</em>"
            >
              {i18next.t("homePage:status.icu")}
            </button>
          </Tag>
        </Grid>

        <Grid item xs={12}>
          <UpdatesToday />
        </Grid>
      </Grid>
      <span
        className="due"
        style={{ fontSize: "80%", paddingTop: 0 }}
        aria-label={getAriaLabelForUpdatedTime(stateCaseData.updatedTime)}
        aria-describedby={getAriaLabelForUpdatedTime(stateCaseData.updatedTime)}
      >
        {i18next.t("homePage:status.note")}
        {stateCaseData.updatedTime}
      </span>
    </div>
  );
}
