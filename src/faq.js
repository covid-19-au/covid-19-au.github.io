import React from "react";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
// import i18n bundle
import i18next from './i18n';

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

function AboutUs() {
  return (
    <div className="card">
      <h2 className="responsiveH2">{i18next.t("faq:faq.title")}</h2>

      <ExpansionPanel style={panelStyles}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
          style={summaryStyles}
        >
          <h4>{i18next.t("faq:faq.sect1")}</h4>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <p>
          {i18next.t("faq:faq.sect1bod1")}{" "}
            <a
              className="citationLink"
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/covid-19-au/covid-19-au.github.io#team-member"
            >
              {i18next.t("faq:faq.sect1bod2")}
            </a>
            .
          </p>
        </ExpansionPanelDetails>
      </ExpansionPanel>

      <ExpansionPanel style={panelStyles}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
          style={summaryStyles}
        >
          <h4>{i18next.t("faq:faq.sect2")}</h4>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <p>
          {i18next.t("faq:faq.sect2bod1")}{" "}
            <a
              className="citationLink"
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/covid-19-au/covid-19-au.github.io"
            >
            {i18next.t("faq:faq.sect2bod2")}  
            </a>
            .
          </p>
        </ExpansionPanelDetails>
      </ExpansionPanel>

      <ExpansionPanel style={panelStyles}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
          style={summaryStyles}
        >
          <h4>{i18next.t("faq:faq.sect3")}</h4>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <p>
          {i18next.t("faq:faq.sect3bod1")}
          </p>
        </ExpansionPanelDetails>
      </ExpansionPanel>

      <ExpansionPanel style={panelStyles}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
          style={summaryStyles}
        >
          <h4>{i18next.t("faq:faq.sect4")}</h4>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <p>
          {i18next.t("faq:faq.sect4bod1")}
          </p>
        </ExpansionPanelDetails>
      </ExpansionPanel>

      <ExpansionPanel style={panelStyles}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
          style={summaryStyles}
        >
          <h4>{i18next.t("faq:faq.sect5")}</h4>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
                    <p>{i18next.t("faq:faq.sect5bod1")}(<a className="citationLink" target="_blank" rel="noopener noreferrer" href="https://www.health.nsw.gov.au/news/Pages/default.aspx">NSW</a>,
                <a className="citationLink" target="_blank" rel="noopener noreferrer" href="https://www.dhhs.vic.gov.au/media-hub-coronavirus-disease-covid-19">VIC</a>,
                <a className="citationLink" target="_blank" rel="noopener noreferrer" href="https://www.qld.gov.au/health/conditions/health-alerts/coronavirus-covid-19/current-status/current-status-and-contact-tracing-alerts">QLD</a>,
                <a className="citationLink" target="_blank" rel="noopener noreferrer" href="https://ww2.health.wa.gov.au/News/Media-releases-listing-page">WA</a>,
                <a className="citationLink" target="_blank" rel="noopener noreferrer" href="https://www.sahealth.sa.gov.au/wps/wcm/connect/Public+Content/SA+Health+Internet/About+us/News+and+media/all+media+releases/">SA</a>,
                <a className="citationLink" target="_blank" rel="noopener noreferrer" href="https://www.health.act.gov.au/about-our-health-system/novel-coronavirus-covid-19">ACT</a>,
                <a className="citationLink" target="_blank" rel="noopener noreferrer" href="https://securent.nt.gov.au/alerts/coronavirus-covid-19-updates">NT</a>,
                <a className="citationLink" target="_blank" rel="noopener noreferrer" href="https://www.dhhs.tas.gov.au/news/2020">TAS</a>){i18next.t("faq:faq.sect5bod2")}<a className="citationLink" target="_blank" rel="noopener noreferrer" href="https://www.abc.net.au/">ABC</a>{i18next.t("faq:faq.sect5bod3")}<a className="citationLink" target="_blank" rel="noopener noreferrer" href="https://github.com/covid-19-au/covid-19-au.github.io"> GitHub repository</a>.</p>
                </ExpansionPanelDetails>
        {/*<ExpansionPanelDetails>*/}
          {/*<p>*/}
            {/*The data sources include the{" "}*/}
            {/*<a*/}
              {/*className="citationLink"*/}
              {/*target="_blank"*/}
              {/*rel="noopener noreferrer"*/}
              {/*href="https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_Australia"*/}
            {/*>*/}
              {/*wikipedia page*/}
            {/*</a>*/}
            {/*, and key news outlets such as{" "}*/}
            {/*<a*/}
              {/*className="citationLink"*/}
              {/*target="_blank"*/}
              {/*rel="noopener noreferrer"*/}
              {/*href="https://www.abc.net.au/"*/}
            {/*>*/}
              {/*the ABC*/}
            {/*</a>*/}
            {/*. More detailed resources can be seen in our{" "}*/}
            {/*<a*/}
              {/*className="citationLink"*/}
              {/*target="_blank"*/}
              {/*rel="noopener noreferrer"*/}
              {/*href="https://github.com/covid-19-au/covid-19-au.github.io"*/}
            {/*>*/}
              {/*{" "}*/}
              {/*GitHub repository*/}
            {/*</a>*/}
            {/*.*/}
          {/*</p>*/}
        {/*</ExpansionPanelDetails>*/}
      </ExpansionPanel>

      <ExpansionPanel style={panelStyles}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
          style={summaryStyles}
        >
          <h4>{i18next.t("faq:faq.sect6")}</h4>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <p>
          {i18next.t("faq:faq.sect6bod1")}
          </p>
        </ExpansionPanelDetails>
      </ExpansionPanel>

      <ExpansionPanel style={panelStyles}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
          style={summaryStyles}
        >
          <h4>{i18next.t("faq:faq.sect7")}</h4>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <p>
          {i18next.t("faq:faq.sect7bod1")}
          </p>
        </ExpansionPanelDetails>
      </ExpansionPanel>

      <ExpansionPanel style={panelStyles}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
          style={summaryStyles}
        >
          <h4>{i18next.t("faq:faq.sect8")}</h4>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <p>
          {i18next.t("faq:faq.sect8bod1")}{" "}
            <a className="citationLink" href="mailto:Chunyang.Chen@monash.edu">
              Chunyang.Chen@monash.edu
            </a>
            .{" "}
          </p>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </div>
  );
}

export default AboutUs;
