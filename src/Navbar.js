import ReactGA from "react-ga";
import React, { useState, useEffect, useRef } from "react";
import { A } from "hookrouter";
// import i18n bundle
import i18next from './i18n';


export default function Navbar({ setNav, nav }) {
    // const [nav, setNav] = useState("Home");
    const [isSticky, setSticky] = useState(false);
    const ref = useRef(null);
    const handleScroll = () => {
        setSticky(ref.current.getBoundingClientRect().top <= 0);
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", () => handleScroll);
        };
    }, []);

    const onClick = e => {
        ReactGA.pageview("/"+e.target.innerText);
        ReactGA.event({category: 'Navbar',action: e.target.innerText});
        setNav(e.target.innerText);
        window.scrollTo(0, 0);
    }

    return (
        <div className={`sticky-wrapper ${isSticky ? "sticky" : ""}`} ref={ref}>
            <div
                className={`row sticky-inner ${isSticky ? "navBarStuck" : "navBar"}`}
                style={{marginRight:0,marginLeft:0}}
            >
        
        <A
            className={`navItems ${
                window.location.pathname === "/" && !isSticky ? "navCurrentPage " : ""
                } ${window.location.pathname === "/" && isSticky ? "navCurrentPageSticky" : ""} `}
            onClick={onClick} href="/"
        >
          <strong>{i18next.t("nav:home")}</strong>
        </A>

        <A
                    className={`navItems ${
                        window.location.pathname.match(/\/state([/.*])?/) && !isSticky ? "navCurrentPage " : ""
                        } ${window.location.pathname.match(/\/state([/.*])?/) && isSticky ? "navCurrentPageSticky" : ""} `}
                    onClick={onClick} href="/state"
                >
          <strong>States</strong>
        </A>

        <A
                    className={`navItems ${
                        window.location.pathname === "/world" && !isSticky ? "navCurrentPage " : ""
                        } ${window.location.pathname === "/world" && isSticky ? "navCurrentPageSticky" : ""} `}
                    onClick={onClick} href="/world"
                >
          <strong>World</strong>
        </A>

                <A
                    className={`navItems ${
                        window.location.pathname === "/info" && !isSticky ? "navCurrentPage " : ""
                        } ${window.location.pathname === "/info" && isSticky ? "navCurrentPageSticky" : ""} `}
                    onClick={onClick} href="/info"
                >
          <strong>{i18next.t("nav:info")}</strong>
        </A>
                <A
                    className={`navItems ${
                        window.location.pathname === "/news" && !isSticky ? "navCurrentPage " : ""
                        } ${window.location.pathname === "/news" && isSticky ? "navCurrentPageSticky" : ""} `}
                    onClick={onClick} href="/news"
                >
          <strong>{i18next.t("nav:news")}</strong>
        </A>

        {/*<A
            className={`navItems ${
                window.location.pathname.includes("/blog") && !isSticky ? "navCurrentPage " : ""
                } ${window.location.pathname.includes("/blog") && isSticky ? "navCurrentPageSticky" : ""} `}
            onClick={onClick} href="/blog"
        >
          <strong>{i18next.t("nav:blog")}</strong>
        </A>*/}

            </div>
        </div>
    );
}