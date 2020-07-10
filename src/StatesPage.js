import React from "react";

class StatesPage extends React.Component {
    constructor() {
        super();
    }

    render() {
        return (
            // STUB: Would be nice to have a selection using
            // material UI-themed elements or something here

            <div style={{width: '100%', maxWidth: '1500px'}}>
                Select a state to see the stats page.

                <ul>
                    <li><a href="/state/nsw">New South Wales</a></li>
                    <li><a href="/state/vic">Victoria</a></li>
                    <li><a href="/state/qld">Queensland</a></li>
                    <li><a href="/state/wa">Western Australia</a></li>
                    <li><a href="/state/sa">South Australia</a></li>
                    <li><a href="/state/tas">Tasmania</a></li>
                    <li><a href="/state/act">Australian Capital Territory</a></li>
                    <li><a href="/state/nt">Northern Territory</a></li>
                </ul>
            </div>
        );
    }
}

export default StatesPage;
