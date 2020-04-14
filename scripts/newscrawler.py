import feedparser
from datetime import datetime, timedelta, timezone
import dateparser
from json import dumps
from dateutil import tz
import csv

# Set default context
import ssl

if hasattr(ssl, "_create_unverified_context"):
    ssl._create_default_https_context = ssl._create_unverified_context


def newscrawler(hour_offset, filter_by, file_to_write, output_type="json"):
    """
	Crawls through the RSS links specified to get news, filtering by hour_offset (how old do you want the news) and
	by keywords (filter_by)

	Inputs: 
		rss_links_name: {string} name of a file containing RSS links to crawl.
		hour_offset: 	{int} number of hours old an article can be
		filter_by:		{[string]} list of keywords.W Article title or summary must have at least one keyword to be included
		file_to_write:	{string} name of file to write .json/csv output to. NOTE: overriding data in file given. 
		output_type: {string} "csv" for csv or "json" for json. (anything else will default to csv)
	Out:
		.json file with news or .csv file with news 
	"""

    rss_feeds = [
        {
            "link": "https://www.abc.net.au/news/feed/8055316/rss.xml",
            "name": "ABC News",
        },
        {
            "link": "https://www.abc.net.au/news/feed/8057136/rss.xml",
            "name": "ABC News",
        },
        {
            "link": "https://www.abc.net.au/news/feed/8053540/rss.xml",
            "name": "ABC News",
        },
        {
            "link": "https://www.abc.net.au/news/feed/8054562/rss.xml",
            "name": "ABC News",
        },
        {
            "link": "https://www.abc.net.au/news/feed/8057540/rss.xml",
            "name": "ABC News",
        },
        {
            "link": "https://www.abc.net.au/news/feed/8057648/rss.xml",
            "name": "ABC News",
        },
        {
            "link": "https://www.abc.net.au/news/feed/8057096/rss.xml",
            "name": "ABC News",
        },
        {"link": "https://www.watoday.com.au/rss/national.xml", "name": "WA Today"},
        {
            "link": "https://www.theguardian.com/australia-news/rss",
            "name": "The Guardian",
        },
        {
            "link": "https://www.health.gov.au/news/rss.xml/",
            "name": "Australian Government Department of Health",
        },
        {
            "link": "https://www.sbs.com.au/news/topic/australia/feed",
            "name": "SBS News",
        },
        {
            "link": "https://www.health.nsw.gov.au/_layouts/feed.aspx?xsl=1&web=/news&page=4ac47e14-04a9-4016-b501-65a23280e841&wp=baabf81e-a904-44f1-8d59-5f6d56519965&pageurl=/news/Pages/rss-nsw-health.aspx",
            "name": "New South Wales Government - Health",
        },
        {
            "link": "https://www2.health.vic.gov.au/rss/health-alerts-and-advisories",
            "name": "Victoria State Government",
        },
        {
            "link": "https://www2.health.vic.gov.au/rss/News",
            "name": "Victoria State Government",
        },
        {"link": "https://thewest.com.au/news/wa/rss", "name": "The West Australian"},
        {
            "link": "https://theconversation.com/au/covid-19/articles.atom",
            "name": "The Conversation",
        },
        {
            "link": "http://newsroom.nt.gov.au/api/RSS/NewsroomIndex",
            "name": "Northern Territory Government",
        },
        {
            "link": "http://statements.qld.gov.au/Feed/Latest/25",
            "name": "Queensland Government",
        },
        {
            "link": "http://statements.qld.gov.au/Feed/minister-for-health-and-minister-for-ambulance-services",
            "name": "Queensland Government",
        },
        {
            "link": "https://www.brisbanetimes.com.au/rss/national/queensland.xml",
            "name": "Brisbane Times",
        },
        {
            "link": "https://www.canberratimes.com.au/rss.xml",
            "name": "The Canberra Times",
        },
    ]

    now = datetime.now().astimezone(tz.gettz("Australia/Melbourne"))

    ##### Get the current news related to the filters ####
    news_articles = {
        "updatedTime": now.strftime("%I:%M%p %d %B %Y"),
        "news": [],
    }

    # create json object
    for feed in rss_feeds:
        d = feedparser.parse(feed["link"])

        author = feed["name"]

        for entry in d.entries:
            # filter by date
            article_date = dateparser.parse(entry.updated).astimezone(
                tz.gettz("Australia/Melbourne")
            )
            if now - timedelta(hours=hour_offset) < article_date:

                # filter by keywords
                if any(x in entry.title.lower() for x in filter_by) or any(
                    x in entry.summary.lower() for x in filter_by
                ):
                    print_date = article_date.strftime("%d %B %Y")
                    print_time = article_date.time().strftime("%I:%M%p")
                    news_articles["news"].append(
                        {
                            "url": entry.link,
                            "title": entry.title,
                            "source": author,
                            "date": print_date,
                            "time": print_time,
                        }
                    )

    # sort by date
    news_articles["news"] = sorted(
        news_articles["news"],
        key=lambda i: (
            datetime.strptime(i["date"], "%d %B %Y"),
            datetime.strptime(i["time"], "%I:%M%p"),
        ),
    )
    news_articles["news"].reverse()
    print(len(news_articles["news"]))
    i = 0
    while i < len(news_articles["news"]) - 1:
        if news_articles["news"][i]["url"] == news_articles["news"][i + 1]["url"]:
            news_articles["news"].pop(i + 1)

        elif news_articles["news"][i]["title"] == news_articles["news"][i + 1]["title"]:
            news_articles["news"].pop(i + 1)

        else:
            i = i + 1

    news_articles["news"] = news_articles["news"][:45]

    if output_type == "json":
        json_string = dumps(news_articles, indent=4)
        out_json = open(file_to_write, "w")
        out_json.write(json_string)

        out_json.close()
    else:  # csv
        out_csv = open(file_to_write, "w")
        header_list = list(news_articles["news"][0].keys())
        writer = csv.DictWriter(out_csv, fieldnames=header_list)
        writer.writerow(
            {
                "url": "Last Updated",
                "title": news_articles["updateTime"][0]["time"],
                "source": "",
                "date": "",
                "time": "",
            }
        )

        writer.writeheader()

        for diction in news_articles["news"]:
            writer.writerow(diction)


if __name__ == "__main__":
    ### default constants ###

    # number of hours to look back
    HOUR_OFFSET = 24
    # keywords to filter tags by
    FILTER_BY = [
        "coronavirus",
        "virus",
        "corona",
        "covid",
        "covid-19",
        "pandemic",
        "self-isolation",
        "lockdown",
    ]

    # rss feeds link file
    FTOWRITE = "src/data/timelinedata.json"
    json_string = newscrawler(HOUR_OFFSET, FILTER_BY, FTOWRITE, output_type="json")

