import ConfirmedMapFns from "../Fns";
import React from "react";

class SchemaTypeUnderlaySelect extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            _underlay: null
        };
    }

    _getSelectHTML() {
        function outputSelects(heading) {
            return absStats[heading]['sub_headers'].map((key) => {
                return '<option value="' + key + '">' + key + '</option>'
            }).join('\n')
        }
        return (
            '<optgroup label="Quick Selections">' +
                '<option value="">(None)</option>' +
                '<option value="Population density (persons/km2)">Population density (persons/km2)</option>' +
                '<option value="Index of Relative Socio-economic Advantage and Disadvantage (%)">Socioeconomic Advantage and Disadvantage (%)</option>' +
                '<option value="Persons - 65 years and over (%)">65 years and over (%)</option>' +
            '</optgroup>'+

            ConfirmedMapFns.sortedKeys(absStats).map((heading) => {
                return (
                    '<optgroup label=' + heading + '>' +
                        outputSelects(heading) +
                    '</optgroup>'
                );
            }).join('\n')
        );
    }

    render() {
        return (
            <div ref={this.underlayBGCont}
                className="key"
                style={{ marginBottom: "8px" }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.8em', marginLeft: '3px' }}>Underlay</div>
                    <select ref={this.otherStatsSelect}
                        style={{ "width": "100%" }}>
                    </select>
            </div>
        );
    }
}
