import { TwitterTimelineEmbed } from "react-twitter-embed";
import React from "react";

export default function Tweets({ province }) {
  return (
    <div className="card">
      <h2>Twitter Feed</h2>
      <div className="centerContent">
        <div className="selfCenter standardWidth">
          {/* Must do check for window.location.pathname === "News" to ensure TwitterTimeLine doesn't do a react state update on an unmounted component. */}
          {window.location.pathname === "News" ? (
            <TwitterTimelineEmbed
              sourceType="list"
              ownerScreenName="8ravoEchoNov"
              slug="COVID19-Australia"
              options={{
                height: 450
              }}
              noHeader={true}
              noFooter={true}
            />
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
}
