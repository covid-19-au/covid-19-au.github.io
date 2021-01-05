import React from "react";
import Acknowledgement from "../common/Acknowledgment";
import ships from "../data/ship.json";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Avatar from "@material-ui/core/Avatar";

const useStyles = makeStyles({
  table: {},
});

export default function Ships() {
  const classes = useStyles();
  let allShipRows = [];

  ships.forEach((ship) => {
    const shipRow = [
      <ExpansionPanel>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
          style={{
            textAlign: "left",
            marginLeft: "1em",
            padding: "0px",
            marginRight: "1px",
          }}
        >
          <Grid container direction="row" alignItems="center">
            <Grid item>
              <Avatar
                style={{
                  marginTop: "0rem",
                  marginRight: "1rem",
                  width: "32px",
                  height: "32px",
                }}
                src={ship.img}
              />
            </Grid>
            <Grid item>
              <h3 className="responsiveH2" valign="middle">
                {ship.name}
              </h3>
            </Grid>
          </Grid>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="caption table">
              <caption>{ship.status}</caption>
              <TableHead>
                <TableRow>
                  <TableCell align="left">Last Update</TableCell>
                  <TableCell align="left">State</TableCell>
                  <TableCell align="left">Cases</TableCell>
                  <TableCell align="left">Deaths</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ship.data.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell component="th" scope="row">
                      <a href={row.url}>{row.update}</a>
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {row.state}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {row.case}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {row.death}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </ExpansionPanelDetails>
      </ExpansionPanel>,
    ];
    allShipRows = allShipRows.concat(shipRow);
  });

  return (
    <div className="card">
      <h2
        style={{ display: "flex" }}
        aria-label="Ships with reported COVID 19 cases"
      >
        Cruise Ships
        <div
          style={{
            alignSelf: "flex-end",
            marginLeft: "auto",
            fontSize: "60%",
          }}
        >
          <Acknowledgement></Acknowledgement>
        </div>
      </h2>
      <p class="key due">
        Ships that are linked to Australian COVID-19 cases. Sorted by case
        estimated total.
      </p>
      <Grid item xs={12}>
        <div>{allShipRows}</div>
      </Grid>
    </div>
  );
}
