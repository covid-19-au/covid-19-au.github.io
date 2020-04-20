import ReactGA from "react-ga";
import React, { useState, useEffect, useRef } from "react";
import { A } from "hookrouter";


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
          <strong>Home</strong>
        </A>
        <A
            className={`navItems ${
                window.location.pathname === "/info" && !isSticky ? "navCurrentPage " : ""
                } ${window.location.pathname === "/info" && isSticky ? "navCurrentPageSticky" : ""} `}
            onClick={onClick} href="/info"
        >
          <strong>Info</strong>
        </A>
        <A
            className={`navItems ${
                window.location.pathname === "/news" && !isSticky ? "navCurrentPage " : ""
                } ${window.location.pathname === "/news" && isSticky ? "navCurrentPageSticky" : ""} `}
            onClick={onClick} href="/news"
        >
          <strong>News</strong>
        </A>
        <A
            className={`navItems ${
                window.location.pathname.includes("/blog") && !isSticky ? "navCurrentPage " : ""
                } ${window.location.pathname.includes("/blog") && isSticky ? "navCurrentPageSticky" : ""} `}
            onClick={onClick} href="/blog"
        >
          <strong>Blog</strong>
        </A>

            </div>
        </div>
    );
}