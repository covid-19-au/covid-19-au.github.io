import React from "react";
import { A } from "hookrouter";

class StatesPage extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            // STUB: Would be nice to have a selection using
            // material UI-themed elements or something here
            <div style={{width: '100%', maxWidth: '1500px'}}>
                Select a state to see the stats page.

                <ul>
                    <li><A href="/state/nsw">New South Wales</A></li>
                    <li><A href="/state/vic">Victoria</A></li>
                    <li><A href="/state/qld">Queensland</A></li>
                    <li><A href="/state/wa">Western Australia</A></li>
                    <li><A href="/state/sa">South Australia</A></li>
                    <li><A href="/state/tas">Tasmania</A></li>
                    <li><A href="/state/act">Australian Capital Territory</A></li>
                    <li><A href="/state/nt">Northern Territory</A></li>
                </ul>
            </div>
        );
    }
}

export default StatesPage;
