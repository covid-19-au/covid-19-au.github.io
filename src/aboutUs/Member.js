import React, { Fragment } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';
import LinkedInIcon from '@material-ui/icons/LinkedIn';
import WebIcon from '@material-ui/icons/Web';
import GitHubIcon from '@material-ui/icons/GitHub';
import EmailIcon from '@material-ui/icons/Email';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center'
  },
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
  medium: {
    width: theme.spacing(5),
    height: theme.spacing(5)
  },
  large: {
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  member: {
    display: 'flex',
    '& > *': {
      margin: '4px',
    },
    width: '100%',
    alignItems: 'center'
  },
  link: {
    color: '#0000EE'
  },
  disabled: {
    pointerEvents: 'none',
    cursor: 'default'
  },
  noMaxWidth: {
    maxWidth: 'none !important',
    margin: '0 !important'
  },
  emailText: {
    fontSize: '1rem'
  }
}));

const getInitial = name => {
  let names = name.split(' ');
  return names[0][0] + names[names.length - 1][0];
}

const noContact = (linkedin, email, github, website) => {
  if (linkedin || email || github || website) {
    return false;
  }
  return true;
}

const HtmlTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}))(Tooltip);


function getDotPoints(items) {
  if (items && items.length) {
    return (
      <div>
        <ul style={{
          padding: "0px 0px 0px 25px",
          margin: "0",
          listStyleType: "disc",
          lineHeight: "1.3em",
        }}>
          {items.map((item) =>
              <li>{item}</li>
          )}
        </ul>
      </div>
    );
  }
  return '';
}


const Member = (props) => {
    const classes = useStyles();
    const { name, linkedin, email, github, website, fileName, items } = props.member;
    return (
        <Grid item xs={6} sm={4} className={`${classes.root} icon`}>
          {noContact(linkedin, email, github, website)
          ? (
            <a className={`${classes.member} ${classes.disabled}`} href="/" target="_blank" rel="noopener noreferrer">
              <Avatar alt={name} src={fileName ? require(`./avatars/${fileName}`) : ''} className={classes.large}>{getInitial(name)}</Avatar>
              <Typography className='responsiveNames' variant='h6' display='block' gutterBottom>{name}</Typography>
            </a>
          )
          : (
            <HtmlTooltip 
              arrow
              interactive
              placement="bottom-start"
              classes={{ tooltip: classes.noMaxWidth }}
              className={classes.member}
              enterTouchDelay={0}
              title={
                <Fragment>
                  <div style={{display: 'flex', justifyContent: 'space-around'}}>
                    {linkedin ? <a target="_blank" rel="noopener noreferrer" href={linkedin}><LinkedInIcon className={classes.medium}/></a> : ''}
                    {website ? <a target="_blank" rel="noopener noreferrer" href={website}><WebIcon className={classes.medium}/></a> : ''}
                    {github ? <a target="_blank" rel="noopener noreferrer" href={github}><GitHubIcon className={classes.medium}/></a> : ''}
                  </div>
                    {email ? <div><a target="_blank" rel="noopener noreferrer" href={`mailto:${email}`}><EmailIcon className={classes.medium}/><span className={ classes.emailText }>{email}</span></a></div> : ''}
                </Fragment>
              }>
              <div>
                <Avatar alt={name} src={fileName ? require(`./avatars/${fileName}`) : ''} className={classes.large}>{getInitial(name)}</Avatar>
                <div>
                  <Typography className={`responsiveNames ${noContact(linkedin, email, github, website) ? '' : classes.link}`} variant='h6' display='block' gutterBottom>{name}</Typography>
                  {getDotPoints(items)}
                </div>
              </div>
            </HtmlTooltip>
          )}
        </Grid>
    )
}

export default Member;