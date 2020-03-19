import React from 'react';
import news from "./data/timelinedata";
import { Timeline, TimelineItem } from "vertical-timeline-component-for-react";
import "./Timeline.css"
import size from "lodash"
import testNews from "./data/newTimelineData"

const jsonNews = require('./data/newTimelineData.json')
const timelineNews = jsonNews["news"]
const updateTime = jsonNews["updateTime"]
console.log(timelineNews)
console.log(updateTime)

function NewsTimeline() {

    const x = 5
    return (
        <div className="card">
            <h2>News Timeline</h2>
            <Timeline lineColor={'#ddd'}>
                {timelineNews.map(news =>
                    <TimelineItem
                        key={timelineNews.indexOf(news)}
                        dateText={news.date + " " + news.time}
                        dateInnerStyle={{ background: '#cb4335' }}
                        style={{ color: '#61b8ff' }}>
                        <a href={news.url}> <h3 style={{ color: ' #2980b9 ' }} >{news.title}</h3></a>
                        <h4 style={{ color: ' #5d6d7e ' }}>{news.source}</h4>
                    </TimelineItem>)
                }
            </Timeline >
            <span className="due">Time in AEDT, last updated at {updateTime[0].time}</span>


        </div >
    )
}
export default NewsTimeline