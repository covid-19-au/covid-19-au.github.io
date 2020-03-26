import React from 'react';


function Fallback(props) {
    return (
        <div className="fallback">

            <div class="text-center">
                <button type="button" class="btn btn-light btn-sm m-1" onClick={() => props.setModalVisibility(true)}>
                    <svg className="bi bi-box-arrow-up" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor"
                         xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd"
                              d="M4.646 4.354a.5.5 0 00.708 0L8 1.707l2.646 2.647a.5.5 0 00.708-.708l-3-3a.5.5 0 00-.708 0l-3 3a.5.5 0 000 .708z"
                              clip-rule="evenodd"/>
                        <path fill-rule="evenodd" d="M8 11.5a.5.5 0 00.5-.5V2a.5.5 0 00-1 0v9a.5.5 0 00.5.5z"
                              clip-rule="evenodd"/>
                        <path fill-rule="evenodd"
                              d="M2.5 14A1.5 1.5 0 004 15.5h8a1.5 1.5 0 001.5-1.5V7A1.5 1.5 0 0012 5.5h-1.5a.5.5 0 000 1H12a.5.5 0 01.5.5v7a.5.5 0 01-.5.5H4a.5.5 0 01-.5-.5V7a.5.5 0 01.5-.5h1.5a.5.5 0 000-1H4A1.5 1.5 0 002.5 7v7z"
                              clip-rule="evenodd"/>
                    </svg>
                    &nbsp;Share this site
                </button>


                <a role="button" aria-disabled="true" target="_blank"  rel="noopener noreferrer" className="btn btn-light btn-sm m-1" href="https://docs.google.com/forms/d/e/1FAIpQLSeX4RU-TomFmq8HAuwTI2_Ieah60A95Gz4XWIMjsyCxZVu7oQ/viewform?usp=sf_link">
                    <svg className="bi bi-chat-square-dots" width="1em" height="1em" viewBox="0 0 16 16"
                         fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd"
                              d="M14 1H2a1 1 0 00-1 1v8a1 1 0 001 1h2.5a2 2 0 011.6.8L8 14.333 9.9 11.8a2 2 0 011.6-.8H14a1 1 0 001-1V2a1 1 0 00-1-1zM2 0a2 2 0 00-2 2v8a2 2 0 002 2h2.5a1 1 0 01.8.4l1.9 2.533a1 1 0 001.6 0l1.9-2.533a1 1 0 01.8-.4H14a2 2 0 002-2V2a2 2 0 00-2-2H2z"
                              clip-rule="evenodd"/>
                        <path
                            d="M5 6a1 1 0 11-2 0 1 1 0 012 0zm4 0a1 1 0 11-2 0 1 1 0 012 0zm4 0a1 1 0 11-2 0 1 1 0 012 0z"/>
                    </svg>
                    &nbsp;Feedback
                </a>


                <button type="button" className="btn btn-light btn-sm m-1" onClick={() => {
                    props.setNav("About");
                    window.scrollTo(0, 0);}}>
                    <svg className="bi bi-info-circle" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor"
                         xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm0 1A8 8 0 108 0a8 8 0 000 16z"
                              clip-rule="evenodd"/>
                        <path
                            d="M8.93 6.588l-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588z"/>
                        <circle cx="8" cy="4.5" r="1"/>
                    </svg>
                    &nbsp;FAQ
                </button>

            </div>
            <div>Template credits to: shfshanyue</div>

            <div>
                Our GitHub:{" "}
                <a href="https://github.com/covid-19-au/covid-19-au.github.io">
                    covid-19-au
                </a>
            </div>
            <div>
                This site is developed by a{" "}
                <a href="https://github.com/covid-19-au/covid-19-au.github.io/blob/dev/README.md">
                    volunteer team
                </a>{" "}
                from the Faculty of IT, Monash University, for non-commercial use only.
            </div>
            {/*<u style={{color:"rgb(89,129,183)"}}><div onClick={()=>{*/}
            {/*props.setNav("About");*/}
            {/*window.scrollTo(0, 0);*/}
            {/*}}>Dashboard FAQ</div></u>*/}
            <div>
                <a href="https://www.webfreecounter.com/" target="_blank" rel="noopener noreferrer">
                    <img
                        src="https://www.webfreecounter.com/hit.php?id=gevkadfx&nd=6&style=1"
                        border="0"
                        alt="hit counter"
                    />
                </a>
            </div>
        </div>
    );
}

export default Fallback