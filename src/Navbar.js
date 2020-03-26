import React, { useState, useEffect, useRef } from "react";
import { A } from "hookrouter";

export default function Navbar() {
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
    window.scrollTo(0, 0);
  };

  return (
    <div className={`sticky-wrapper ${isSticky ? "sticky" : ""}`} ref={ref}>
      <div
        className={`row sticky-inner ${isSticky ? "navBarStuck" : "navBar"}`}
      >
        <A
          className={`navItems ${
            window.location.pathname === "/" && !isSticky
              ? "navCurrentPage "
              : ""
          } ${
            window.location.pathname === "/" && isSticky
              ? "navCurrentPageSticky"
              : ""
          } `}
          onClick={onClick}
          href="/"
        >
          <strong>Home</strong>
        </A>
        <A
          className={`navItems ${
            window.location.pathname === "/info" && !isSticky
              ? "navCurrentPage "
              : ""
          } ${
            window.location.pathname === "/info" && isSticky
              ? "navCurrentPageSticky"
              : ""
          } `}
          onClick={onClick}
          href="/info"
        >
          <strong>Info</strong>
        </A>
        <A
          className={`navItems ${
            window.location.pathname === "/news" && !isSticky
              ? "navCurrentPage "
              : ""
          } ${
            window.location.pathname === "/news" && isSticky
              ? "navCurrentPageSticky"
              : ""
          } `}
          onClick={onClick}
          href="/news"
        >
          <strong>News</strong>
        </A>
      </div>
    </div>
  );
}
