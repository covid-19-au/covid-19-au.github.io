import React, { lazy, Suspense } from 'react';
import Typography from '@material-ui/core/Typography';
import { Developers, Project_Manager, Promotion, Data_Collection, Contributor, Language } from './teams_helper';
import './aboutUs.css';

const Team = lazy(() => import('./Team'))

const AboutUs = () => {
    return (
        <div className="card">
            <div className="aboutUsRow">
                <div className="aboutUsColumn">
                    <h1 className="aboutUsHeadings">Who are we?</h1>
                    <Typography variant="body1" gutterBottom>
                        With the Covid-19 crisis rapidly spreading across the globe, Australia found itself unprepared for the outbreak.
                        Dr. Chunyang Chen of Monash University's Faculty of Technology noticed an inconsistency and lack of accurate reporting in
                        Australia, and gathered a small team of students to combat this problem. A few days later, Covid-19-au was live.
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
                </div>
                <div className="aboutUsColumn">
                    <Suspense fallback={<h1>Still Loading…</h1>}>
                        <Team team={Project_Manager} />
                        <Team team={Developers} />
                        <Team team={Promotion} />
                        <Team team={Data_Collection} />
                        <Team team={Contributor} />
                        <Team team={Language} />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}

export default AboutUs;