import React from 'react';
import ReactGA from "react-ga";
import {A} from 'hookrouter';

// ReactGA.initialize("UA-160673543-1",{gaoOptions:{siteSpeedSampleRate: 100}});
function Fallback(props) {
    return (
        <div className="fallback">

            <div className="text-center">
                <button type="button" className="btn btn-light btn-sm m-1" onClick={() => {
                    ReactGA.event({category: 'Fallback',action: "share"});
                    props.setModalVisibility(true)}}>
                    <svg className="bi bi-box-arrow-up" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor"
                         xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd"
                              d="M4.646 4.354a.5.5 0 00.708 0L8 1.707l2.646 2.647a.5.5 0 00.708-.708l-3-3a.5.5 0 00-.708 0l-3 3a.5.5 0 000 .708z"
                              clipRule="evenodd"/>
                        <path fillRule="evenodd" d="M8 11.5a.5.5 0 00.5-.5V2a.5.5 0 00-1 0v9a.5.5 0 00.5.5z"
                              clipRule="evenodd"/>
                        <path fillRule="evenodd"
                              d="M2.5 14A1.5 1.5 0 004 15.5h8a1.5 1.5 0 001.5-1.5V7A1.5 1.5 0 0012 5.5h-1.5a.5.5 0 000 1H12a.5.5 0 01.5.5v7a.5.5 0 01-.5.5H4a.5.5 0 01-.5-.5V7a.5.5 0 01.5-.5h1.5a.5.5 0 000-1H4A1.5 1.5 0 002.5 7v7z"
                              clipRule="evenodd"/>
                    </svg>
                    &nbsp;Share this site
                </button>


                <a role="button" aria-disabled="true" onClick={()=>{
                    ReactGA.event({category: 'Fallback',action: "feedback"});
                }} target="_blank"  rel="noopener noreferrer" className="btn btn-light btn-sm m-1" href="https://docs.google.com/forms/d/e/1FAIpQLSeX4RU-TomFmq8HAuwTI2_Ieah60A95Gz4XWIMjsyCxZVu7oQ/viewform?usp=sf_link">
                    <svg className="bi bi-chat-square-dots" width="1em" height="1em" viewBox="0 0 16 16"
                         fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd"
                              d="M14 1H2a1 1 0 00-1 1v8a1 1 0 001 1h2.5a2 2 0 011.6.8L8 14.333 9.9 11.8a2 2 0 011.6-.8H14a1 1 0 001-1V2a1 1 0 00-1-1zM2 0a2 2 0 00-2 2v8a2 2 0 002 2h2.5a1 1 0 01.8.4l1.9 2.533a1 1 0 001.6 0l1.9-2.533a1 1 0 01.8-.4H14a2 2 0 002-2V2a2 2 0 00-2-2H2z"
                              clipRule="evenodd"/>
                        <path
                            d="M5 6a1 1 0 11-2 0 1 1 0 012 0zm4 0a1 1 0 11-2 0 1 1 0 012 0zm4 0a1 1 0 11-2 0 1 1 0 012 0z"/>
                    </svg>
                    &nbsp;Feedback
                </a>

                <A href="/faq">
                <button type="button" className="btn btn-light btn-sm m-1" onClick={() => {
                    ReactGA.event({category: 'Fallback',action: "faq"});
                    props.setNav("About");
                    window.scrollTo(0, 0);}}>
                    <svg className="bi bi-info-circle" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor"
                         xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm0 1A8 8 0 108 0a8 8 0 000 16z"
                              clipRule="evenodd"/>
                        <path
                            d="M8.93 6.588l-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588z"/>
                        <circle cx="8" cy="4.5" r="1"/>
                    </svg>
                    &nbsp;FAQ
                </button>
                </A>
              <div>
                <a role="button" aria-disabled="true" target="_blank" rel="noopener noreferrer" className="btn btn-light btn-sm m-1" href="https://github.com/covid-19-au/covid-19-au.github.io">
                  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="m12 .5c-6.63 0-12 5.28-12 11.792 0 5.211 3.438 9.63 8.205 11.188.6.111.82-.254.82-.567 0-.28-.01-1.022-.015-2.005-3.338.711-4.042-1.582-4.042-1.582-.546-1.361-1.335-1.725-1.335-1.725-1.087-.731.084-.716.084-.716 1.205.082 1.838 1.215 1.838 1.215 1.07 1.803 2.809 1.282 3.495.981.108-.763.417-1.282.76-1.577-2.665-.295-5.466-1.309-5.466-5.827 0-1.287.465-2.339 1.235-3.164-.135-.298-.54-1.497.105-3.121 0 0 1.005-.316 3.3 1.209.96-.262 1.98-.392 3-.398 1.02.006 2.04.136 3 .398 2.28-1.525 3.285-1.209 3.285-1.209.645 1.624.24 2.823.12 3.121.765.825 1.23 1.877 1.23 3.164 0 4.53-2.805 5.527-5.475 5.817.42.354.81 1.077.81 2.182 0 1.578-.015 2.846-.015 3.229 0 .309.21.678.825.56 4.801-1.548 8.236-5.97 8.236-11.173 0-6.512-5.373-11.792-12-11.792z" fill="#212121"/>
                  </svg>&nbsp;GitHub
                </a>
              </div>

            </div>
            <div>Template credits to: shfshanyue</div>

            <div>
                This site is developed by a{" "}
                <a href="https://github.com/covid-19-au/covid-19-au.github.io/blob/dev/README.md">
                    volunteer team
                </a>{" "}
                , for non-commercial use only.
            </div>

            <div>
                <svg className="bi bi-person-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                </svg>
                <a href="https://www.webfreecounter.com/" target="_blank" rel="noopener noreferrer">
                    <img
                        src="https://www.webfreecounter.com/hit.php?id=gevkadfx&nd=9&style=1"
                        border="0"
                        alt="hit counter"
                    />
                </a>
            </div>
        </div>
    );
}

export default Fallback
