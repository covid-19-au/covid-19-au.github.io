import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import "dayjs/locale/en-au";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

function New({ title, contentSnippet, link, pubDate, pubDateStr }) {
  return (
    <div className="new">
      <div className="new-date">
        <div className="relative">
          {dayjs(pubDate)
            .locale("en-au")
            .fromNow()}
        </div>
        {dayjs(pubDate).format("YYYY-MM-DD HH:mm")}
      </div>
      <a href={link} className="title">
        {title}
      </a>
      <div className="summary">{contentSnippet.split("&nbsp;")[0]}...</div>
    </div>
  );
}

export default function News({ province }) {
  let Parser = require("rss-parser");

  const [len, setLen] = useState(3);
  const [news, setNews] = useState([]);

  useEffect(() => {
    let parser = new Parser({
      headers: { "Access-Control-Allow-Origin": "*" }
    });
    const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
    parser.parseURL(
      CORS_PROXY +
        "https://news.google.com/rss/search?q=COVID%2019-Australia&hl=en-US&gl=AU&ceid=AU:en",
      function(err, feed) {
        if (err) throw err;
        // console.log(feed.title);
        // feed.items.forEach(function(entry) {
        //     console.log(entry);
        // })
        setNews(feed.items);
      }
    );
  }, []);

  return (
    <div className="card">
      <h2>News Feed</h2>
      {news.slice(0, len).map(n => (
        <New {...n} key={n.id} />
      ))}
      <div
        className="more"
        onClick={() => {
          setLen(len + 2);
        }}
      >
        <i>
          <u>Click for more news...</u>
        </i>
      </div>
    </div>
  );
}
