import React, { lazy, Suspense } from 'react';
import Typography from '@material-ui/core/Typography';
import { Developers, Project_Manager, Promotion, Data_Collection, Contributor, Language } from './teams_helper';
import './aboutUs.css';

const Team = lazy(() => import('./Team'))

const AboutUs = () => {
    return (
        <div className="card">
            <div className="aboutText">
                <h1 className="aboutUsHeadings">Who are we?</h1>
                <Typography variant="body1" gutterBottom>
                    With the Covid-19 crisis rapidly spreading across the globe, Australia found itself unprepared for the outbreak.
                    Dr. Chunyang Chen of Monash University's Faculty of Information Technology noticed an inconsistency and lack of accurate reporting in
                    Australia's confirmed cases, and gathered a small team of students to combat this problem. A few days later, Covid-19-au was live.
                </Typography>
                <Typography variant="body1" gutterBottom>
                    With the website up and running, we needed to spread the word so that Australian's could make use of our website and stay informed on the situation.
                    Luckily, with a new group of volunteers joining the team, there was someone whose expertise was in marketing who took charge and spread the word of our site 
                    across many social media platforms.
                </Typography>
                <Typography variant="body1" gutterBottom>
                    A sudden influx of volunteers joined the team, and our website visits quickly ramped up to over 2 million in less than a week.
                    As more people joined, we split into several teams; data/news collection, developers, and promotions.
                </Typography>
                <Typography variant="body1" gutterBottom>
                    The operation and maintenance of our site depends on the hard work of our volunteers. They are tirelessly verifying and collecting data
                    where necessary. The promotions team are constantly giving updates, helpful information and working to ease the worries of the community
                    and help everyone stay positive. Our developers are constantly working to bring new features and anaylsis of data to our site, so that our
                    users can find more use and benefit.
                </Typography>
                <Typography variant="body1" gutterBottom>
                    The team at Covid-19-au wish the everyone good health and safety, and we hope that our platform has been helpful in informing you of the situation.
                    We will continue to maintain and update our site and hope that you can support us by sharing it with your friends and family.
                </Typography>
                <h1 className="aboutUsHeadings">Related Publications</h1>
                <Typography variant="body1" gutterBottom>
                    During the development of this dashboard, we summarised lessons learned, analysed users' requirements, and finished thw following two research projects:
                    <ul style={{
                        padding: "0px 0px 0px 25px",
                        margin: "0",
                        listStyleType: "disc",
                        lineHeight: "1.3em",
                    }}>
                        <li>
                            [ICSE-22-SEIS] <b>Software Engineers Response to Public Crisis: Lessons Learnt from Spontaneously Building an Informative COVID-19 Dashboard</b><br/>
                            <i>The 44th International Conference on Software Engineering, Software Engineering in Society Track</i><br/>
                            <a className="citationLink" target="_blank" rel="noopener noreferrer" href="https://arxiv.org/abs/2204.08674" >preprint</a><br/>
                        </li>
                        <li>
                            [TSC-21] <b>An Empirical Study on How Well Do COVID-19 Information Dashboards Service User Information Needs</b><br/>
                            <i>IEEE Transactions on Services Computing</i><br/>
                            <a className="citationLink" target="_blank" rel="noopener noreferrer" href="https://arxiv.org/abs/2206.00103" >preprint</a>
                        </li>
                    </ul>
                </Typography>
                <h1 className="aboutUsHeadings">How you can help us</h1>
                <Typography variant="body1" gutterBottom>
                    To improve our site, we are working with researchers from Monash University and Rochester Institute of Technology, to investigate how our users seek information about COVID-19. We would be very grateful, if you could fill in this 10-min survey.
                    The survey results will eventually be released <a className="citationLink" target="_blank" rel="noopener noreferrer" href="https://covid19onlinesurvey.org" >here</a>.
                </Typography>
            </div>
            <Suspense fallback={<h1>Still Loading…</h1>}>
                <Team team={Project_Manager} />
                <Team team={Developers} />
                <Team team={Promotion} />
                <Team team={Data_Collection} />
                <Team team={Contributor} />
                <Team team={Language} />
            </Suspense>
        </div>
    )
}

export default AboutUs;