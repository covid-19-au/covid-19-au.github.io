import SocialMediaShareModal from './socialMediaShare/SocialMediaShareModal';
import React, { useState } from "react";
import ReactGA from "react-ga";
import i18next from "./i18n";
import LanguageIcon from '@material-ui/icons/Language';
import Button from '@material-ui/core/Button';
import InputBase from '@material-ui/core/InputBase';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { A } from "hookrouter";

export default function Header({ province }) {

    const [showSocialMediaIcons, setShowSocialMediaIcons] = useState(false);

    const setModalVisibility = state => {
        setShowSocialMediaIcons(state);
    };

    const changeLanguage = code => e => {
        localStorage.setItem('language', code);
        window.location.reload();
    };

    const BootstrapInput = withStyles((theme) => ({
        root: {
            'label + &': {
                marginTop: theme.spacing(3),
            },
        },
        input: {
            borderRadius: 4,
            position: 'relative',
            backgroundColor: "transparent",
            border: 'none',
            fontSize: 16,
            transition: theme.transitions.create(['border-color', 'box-shadow']),
            // Use the system font instead of the default Roboto font.

        },
    }))(InputBase);

    const [state, setState] = React.useState({
        lang: ""
    });

    const handleChange = (event) => {
        const name = event.target.name;
        setState({
            ...state,
            [name]: event.target.value,
        });
        changeLanguage(event.target.value)

    };

    const useStyles = makeStyles((theme) => ({
        margin: {
            margin: theme.spacing(1),
        },
    }));


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
                }}><i className="fas fa-share-alt"></i></a>

                <a style={{ marginLeft: '0.8rem' }} target="_blank" rel="noopener noreferrer" onClick={() => { ReactGA.event({ category: 'Header', action: "twitter" }) }} href="https://twitter.com/covid19augithub"><i style={{ fontSize: "2rem" }} className="fab fa-twitter"></i></a>
                <a style={{ marginLeft: '0.8rem' }} target="_blank" rel="noopener noreferrer" onClick={() => { ReactGA.event({ category: 'Header', action: "instagram" }) }} href="https://www.instagram.com/covid19_au/"><i style={{ fontSize: "2rem" }} className="fab fa-instagram"></i></a>
                <a style={{ marginLeft: '0.8rem' }} target="_blank" rel="noopener noreferrer" onClick={() => { ReactGA.event({ category: 'Header', action: "github" }) }} href="https://www.facebook.com/covid19au.github/"><i style={{ fontSize: "2rem" }} className="fab fa-facebook"></i></a>
                <A className={window.location.pathname === '/blog' ? 'navCurrentPage' : ''} style={{ marginLeft: '4rem' }} target="_blank" rel="noopener noreferrer" onClick={() => { ReactGA.event({ category: 'Header', action: "github" }) }} href="/blog"><i style={{ fontSize: "2rem" }} className="fas fa-rss"></i><span style={{fontSize: "0.7em", display: "inline-block", verticalAlign: "-4%", paddingLeft: "6px", color: "#EEE"}}>blog</span></A>
                {/*} <br />
                <LanguageIcon style={{ fontSize: "2rem", marginRight: "0.5rem", marginLeft: "1rem" }} />
                <Select
                    labelId="demo-customized-select-label"
                    id="demo-customized-select"
                    native
                    value={state.lang}
                    onChange={(event) => changeLanguage(event.target.value)}
                    style={{ textTransform: "none", color: "white", border: "none", borderRadius: "5px", fontSize: "1.2rem", fontWeight: "500" }}
                    IconComponent={() => (
                        <div style={{ margin: "0px" }} />
                    )}
                    input={<BootstrapInput />}
                >

                    >
                    <option value='en'>English</option>
                    <option value='es'>Español</option>
                </Select>*/}
                <div className="dropdown">
                    <Button variant="outlined" size="medium" data-toggle="dropdown" style={{ textTransform: "none", color: "white", border: "none", borderRadius: "5px", fontSize: "1.2rem", fontWeight: "500" }} startIcon={<LanguageIcon style={{ fontSize: "1.8rem" }} />}>{i18next.t("nav:lang")}</Button>
                    {/* <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton"
                        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={{ backgroundColor: "transparent", border: "1px solid white", borderRadius: "5px", outline: "none", padding: "5px", marginTop: "0.1rem", marginBottom: 0 }}>
                        {i18next.t("nav:lang")}
                    </button> */}

                    <div className="dropdown-menu" >
                        <a className="dropdown-item" onClick={changeLanguage('en')}>English</a>
                        <div className="dropdown-divider"></div>
                        <a className="dropdown-item" onClick={changeLanguage('es')}>Español</a>
                        <div className="dropdown-divider"></div>
                        <a className="dropdown-item" onClick={changeLanguage('vi')}>Tiếng Việt</a>
                        <div className="dropdown-divider"></div>
                        <a className="dropdown-item" onClick={changeLanguage('zh')}>简体中文</a>
                        <div className="dropdown-divider"></div>
                        <a className="dropdown-item" onClick={changeLanguage('tw')}>繁體中文</a>
                        <div className="dropdown-divider"></div>
                        <a className="dropdown-item" onClick={changeLanguage('ko')}>한국어</a>
                        <div className="dropdown-divider"></div>
                        <a className="dropdown-item" onClick={changeLanguage('ja')}>日本語</a>
                    </div>
                </div>
            </div>

            {/*<i>By Students from Monash</i>*/}
        </header >
    );
}