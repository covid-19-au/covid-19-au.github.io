import React from 'react';
import { Timeline, TimelineItem } from "vertical-timeline-component-for-react";
import "./NewsTimeline.css"
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

const jsonNews = require('./data/timelinedata.json')
const timelineNews = jsonNews["news"]
const updatedTime = jsonNews["updatedTime"]

const listStyles = {
    maxHeight: 500,
    position: 'relative',
    overflow: 'auto',
    minHeight: 500,
    marginRight: 0,
    padding: 0
}

const newestColour = "#3498DB"
const middleColour = "#85C1E9"
const oldestColour = "#D6EAF8"


const newsLength = timelineNews.length

const newestNews = timelineNews.slice(0, newsLength / 3)
const middleNews = timelineNews.slice(newsLength / 3, newsLength * 2 / 3)
const oldestNews = timelineNews.slice(newsLength * 2 / 3, newsLength)

function NewsTimeline() {

    return (
        <div className="card">
            <h2>News Timeline</h2>
            <Timeline lineColor={'#ddd'}>
                <List style={listStyles}>
                    {newestNews.map(news =>
                        <TimelineItem
                            key={timelineNews.indexOf(news)}
                            dateText={news.date + " " + news.time}
                            dateInnerStyle={{ background: "#3498DB" }}>
                            <a href={news.url}> <h4 style={{ color: ' #5499C7 ' }} >{news.title}</h4></a>
                            <h5 style={{ color: ' #5d6d7e ' }}>{news.source}</h5>
                        </TimelineItem>)
                    }
                    {middleNews.map(news =>
                        <TimelineItem
                            key={timelineNews.indexOf(news)}
                            dateText={news.date + " " + news.time}
                            dateInnerStyle={{ background: "#85C1E9" }}>
                            <a href={news.url}> <h4 style={{ color: ' #5499C7 ' }} >{news.title}</h4></a>
                            <h5 style={{ color: ' #5d6d7e ' }}>{news.source}</h5>
                        </TimelineItem>)
                    }
                    {oldestNews.map(news =>
                        <TimelineItem
                            key={timelineNews.indexOf(news)}
                            dateText={news.date + " " + news.time}
                            dateInnerStyle={{ background: "#D6EAF8" }}>
                            <a href={news.url}> <h4 style={{ color: ' #5499C7 ' }} >{news.title}</h4></a>
                            <h5 style={{ color: ' #5d6d7e ' }}>{news.source}</h5>
                        </TimelineItem>)
                    }

                </List>
            </Timeline >
            <span className="due">Time in AEDT, last updated at {updatedTime}</span>


        </div >
    )
}
export default NewsTimeline