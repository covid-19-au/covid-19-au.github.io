

import SocialMediaShareModal from './socialMediaShare/SocialMediaShareModal';
import React, {
    useState,
    Suspense,
    useEffect,
    useRef
} from "react";
import ReactGA from "react-ga";
import i18next from "./i18n";

export default function Header({ province }) {

    const [showSocialMediaIcons, setShowSocialMediaIcons] = useState(false);

    const setModalVisibility = state => {
        setShowSocialMediaIcons(state);
    };

    const changeLanguage = code => e => {
        localStorage.setItem('language', code);
        window.location.reload();
    };

    return (
        <header>


            <div className="bg"></div>
            <h1
                style={{
                    fontSize: "170%",
                    color: "white",
                    textAlign: "center",
                    fontWeight: "bold"
                }}
            >
                COVID-19 in Australia
      </h1>
            <h1
                style={{
                    fontSize: "160%",
                    color: "white",
                    textAlign: "center",
                    fontWeight: "bold"
                }}
            >
                Real-Time Report

      </h1>

            <div className="slogan"><i>Stay Calm, Stay Informed</i></div>

            <div style={{
                fontSize: "120%",
                color: "white",
                textAlign: "center",
                marginTop: "1rem"
            }}>
                <SocialMediaShareModal
                    visible={showSocialMediaIcons}
                    onCancel={() => setShowSocialMediaIcons(false)}
                />
                <a onClick={() => {
                    ReactGA.event({ category: 'Header', action: "share" });
                    setModalVisibility(true)
                }}><i className="fas fa-share-alt"></i></a>
                <a style={{ marginLeft: '0.5rem' }} target="_blank" rel="noopener noreferrer" onClick={() => { ReactGA.event({ category: 'Header', action: "twitter" }) }} href="https://twitter.com/covid19augithub"><i className="fab fa-twitter"></i></a>
                <a style={{ marginLeft: '0.5rem' }} target="_blank" rel="noopener noreferrer" onClick={() => { ReactGA.event({ category: 'Header', action: "instagram" }) }} href="https://www.instagram.com/covid19_au/"><i className="fab fa-instagram"></i></a>
                <a style={{ marginLeft: '0.5rem' }} target="_blank" rel="noopener noreferrer" onClick={() => { ReactGA.event({ category: 'Header', action: "github" }) }} href="https://www.facebook.com/covid19au.github/"><i className="fab fa-facebook"></i></a>
                <div className="dropdown">
                    <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton"
                            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={{ backgroundColor: "transparent", border: "none", outline: "none" }}>
                        {i18next.t("nav:lang")}
                    </button>
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
        </header>
    );
}