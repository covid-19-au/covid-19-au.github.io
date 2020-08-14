import SocialMediaShareModal from './socialMediaShare/SocialMediaShareModal';
import React, { useState } from "react";
import ReactGA from "react-ga";
import i18next from "./i18n";
import LanguageIcon from '@material-ui/icons/Language';
import Button from '@material-ui/core/Button';
import InputBase from '@material-ui/core/InputBase';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { A } from "hookrouter";
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRss, faShareAlt } from '@fortawesome/free-solid-svg-icons'
import { faTwitter, faInstagram, faFacebook } from '@fortawesome/free-brands-svg-icons'


export default function Header({ province }) {

    const [showSocialMediaIcons, setShowSocialMediaIcons] = useState(false);

    const setModalVisibility = state => {
        setShowSocialMediaIcons(state);
    };

    const changeLanguage = code => {
        localStorage.setItem('language', code);
        window.location.reload();
    };

    const [anchorEl, setAnchorEl] = React.useState(
        null
    );
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <header>
            <div className="bg"></div>
            <h1
                style={{
                    fontSize: "190%",
                    color: "white",
                    textAlign: "center",
                    fontWeight: "bold"
                }}
            >
                COVID-19 in Australia
            </h1>

            <h1
                style={{
                    fontSize: "180%",
                    color: "white",
                    textAlign: "center",
                    fontWeight: "bold"
                }}
            >
                Real-Time Report
            </h1>

            <div className="slogan"><i>Stay Calm, Stay Informed</i></div>

            <div style={{
                fontSize: "2rem",
                color: "white",
                textAlign: "center",
                marginTop: "1.3rem"
            }}>
                <SocialMediaShareModal
                    visible={showSocialMediaIcons}
                    onCancel={() => setShowSocialMediaIcons(false)}
                />
                <a onClick={() => {
                    ReactGA.event({ category: 'Header', action: "share" });
                    setModalVisibility(true)
                }}><FontAwesomeIcon icon={faShareAlt} /></a>

                <a style={{ marginLeft: '0.8rem' }}
                   target="_blank"
                   rel="noopener noreferrer"
                   onClick={() => { ReactGA.event({ category: 'Header', action: "twitter" }) }}
                   href="https://twitter.com/covid19augithub"><FontAwesomeIcon style={{ fontSize: "2rem" }}
                                                                               icon={faTwitter} /></a>
                <a style={{ marginLeft: '0.8rem' }}
                   target="_blank"
                   rel="noopener noreferrer"
                   onClick={() => { ReactGA.event({ category: 'Header', action: "instagram" }) }}
                   href="https://www.instagram.com/covid19_au/"><FontAwesomeIcon style={{ fontSize: "2rem" }}
                                                                                 icon={faInstagram} /></a>
                <a style={{ marginLeft: '0.8rem' }}
                   target="_blank"
                   rel="noopener noreferrer"
                   onClick={() => { ReactGA.event({ category: 'Header', action: "github" }) }}
                   href="https://www.facebook.com/covid19au.github/"><FontAwesomeIcon style={{ fontSize: "2rem" }}
                                                                                      icon={faFacebook} /></a>
                <A className={window.location.pathname === '/blog' ? 'navCurrentPage' : ''}
                   style={{ marginLeft: '4rem' }}
                   target="_blank"
                   rel="noopener noreferrer"
                   onClick={() => { ReactGA.event({ category: 'Header', action: "github" }) }}
                   href="/blog">
                    <FontAwesomeIcon style={{ fontSize: "2rem" }}
                                     icon={faRss} />
                    <span style={{
                        fontSize: "0.7em",
                        display: "inline-block",
                        verticalAlign: "-4%",
                        paddingLeft: "6px",
                        color: "#EEE"
                    }}>blog</span></A>

                <div className="dropdown" style={{position: "relative"}}>
                    <Button variant="outlined"
                            size="medium"
                            data-toggle="dropdown"
                            onClick={(e) => handleClick(e)}
                            style={{
                                textTransform: "none",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                fontSize: "1.2rem",
                                fontWeight: "500"
                            }}
                            startIcon={
                                <LanguageIcon style={{ fontSize: "1.8rem" }} />
                            }>
                        {i18next.t("nav:lang")}
                    </Button>

                    <Menu
                        id="simple-menu"
                        getContentAnchorEl={null}
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                        }}
                    >
                        <MenuItem onClick={e => {changeLanguage('en'); handleClose(e)}}>English</MenuItem>
                        <MenuItem onClick={e => {changeLanguage('es'); handleClose(e)}}>Español</MenuItem>
                        <MenuItem onClick={e => {changeLanguage('vi'); handleClose(e)}}>Tiếng Việt</MenuItem>
                        <MenuItem onClick={e => {changeLanguage('zh'); handleClose(e)}}>简体中文</MenuItem>
                        <MenuItem onClick={e => {changeLanguage('tw'); handleClose(e)}}>繁體中文</MenuItem>
                        <MenuItem onClick={e => {changeLanguage('ko'); handleClose(e)}}>한국어</MenuItem>
                        <MenuItem onClick={e => {changeLanguage('ja'); handleClose(e)}}>日本語</MenuItem>
                    </Menu>
                </div>
            </div>

            {/*<i>By Students from Monash</i>*/}
        </header >
    );
}