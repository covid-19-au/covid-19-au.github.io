import React from "react";
import ReactGA from "react-ga";
import { A } from "hookrouter";
import Button from "@material-ui/core/Button";
import InfoSharpIcon from "@material-ui/icons/InfoSharp";
import GitHubIcon from "@material-ui/icons/GitHub";
import PeopleIcon from "@material-ui/icons/People";
import FeedbackIcon from "@material-ui/icons/Feedback";
import ShareIcon from "@material-ui/icons/Share";
import { makeStyles } from "@material-ui/core/styles";
import PrivacyPolicy from "./PrivacyPolicy.js";

const useStyles = makeStyles((theme) => ({
  button: {
    margin: "2px",
    backgroundColor: "white",
    variant: "outlined",
    textTransform: "none",
  },
}));

// ReactGA.initialize("UA-160673543-1",{gaoOptions:{siteSpeedSampleRate: 100}});
function Fallback(props) {
  const classes = useStyles();

  return (
    <div className="fallback">
      <div>
        <Button
          onClick={() => {
            ReactGA.event({ category: "Fallback", action: "share" });
            props.setModalVisibility(true);
          }}
          variant="outlined"
          startIcon={<ShareIcon />}
          className={classes.button}
        >
          Share this site
        </Button>

        <Button
          href="https://docs.google.com/forms/d/e/1FAIpQLSeX4RU-TomFmq8HAuwTI2_Ieah60A95Gz4XWIMjsyCxZVu7oQ/viewform?usp=sf_link"
          variant="outlined"
          startIcon={<FeedbackIcon />}
          className={classes.button}
        >
          Feedback
        </Button>
        <Button
          href="/faq"
          variant="outlined"
          startIcon={<InfoSharpIcon />}
          className={classes.button}
        >
          FAQ
        </Button>
        <Button
          href="https://github.com/covid-19-au/covid-19-au.github.io"
          variant="outlined"
          startIcon={<GitHubIcon />}
          className={classes.button}
        >
          GitHub
        </Button>
        <Button
          href="/about-us"
          variant="outlined"
          startIcon={<PeopleIcon />}
          className={classes.button}
        >
          About Us
        </Button>
        <PrivacyPolicy></PrivacyPolicy>
      </div>
      <div>Template credits to: shfshanyue</div>

      <div>
        This site is developed by a{" "}
        <a
          style={{ color: "blue" }}
          href="https://github.com/covid-19-au/covid-19-au.github.io/blob/dev/README.md"
          target="_blank"
          rel="noopener noreferrer"
        >
          <u>volunteer team</u>
        </a>
        , for non-commercial use only. Support our{" "}
        <a
          style={{ color: "blue" }}
          href="https://covid19onlinesurvey.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          <u>research</u>
        </a>
        .
      </div>

      <div>
        We acknowledge Aboriginal and Torres Strait Islander people as the
        Traditional Custodians of the land and acknowledge and pay respect to
        their Elders, past and present.
      </div>

      <div>
        We also acknowledge the efforts of doctors, nurses, and other healthcare
        professionals, in fight against this pandemic.
      </div>
      <div>
        The translations are still being tested. Please be aware that there may
        be mistranslations.
      </div>
      <div>
        A big thank you to{" "}
        <a
          href="://www.mapbox.com/"
          style={{ color: "blue" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          <u>Mapbox</u>
        </a>
        {""},{" "}
        <a
          href="://www.slack.com/"
          style={{ color: "blue" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          <u>Slack</u>
        </a>
        {""},{" "}
        <a
          href="://aws.amazon.com/"
          style={{ color: "blue" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          <u>AWS</u>
        </a>{" "}
        for their sponsorship of this website!
      </div>

      <div>
        <svg
          className="bi bi-person-fill"
          width="1em"
          height="1em"
          viewBox="0 0 16 16"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 100-6 3 3 0 000 6z"
            clipRule="evenodd"
          />
        </svg>

        <div id="sfcly4m9kmug45da8x8ba6fchlharqeeqm1"></div>
        <script
          type="text/javascript"
          src="https://counter3.stat.ovh/private/counter.js?c=ly4m9kmug45da8x8ba6fchlharqeeqm1&down=async"
          async
        ></script>
        <a href="https://www.freecounterstat.com" title="free hit counter">
          <img
            src="https://counter3.stat.ovh/private/freecounterstat.php?c=ly4m9kmug45da8x8ba6fchlharqeeqm1"
            border="0"
            title="free hit counter"
            alt="free hit counter"
          />
        </a>
      </div>
    </div>
  );
}

export default Fallback;
