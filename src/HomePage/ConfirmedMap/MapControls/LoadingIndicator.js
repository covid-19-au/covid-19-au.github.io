import React from "react";


class LoadingIndicator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            shown: false
        };
    }

    render() {
        const loadedWidth = ((
            this.state.currentValue / this.state.maxValue
        )*150) - 6;

        return (
            <div className={
                "loading-cont " + (
                    this.state.shown ?
                        "loading-cont-shown" : "loading-cont-hidden"
                )
            }>
                <div className="loading-pad">
                    <div className="loading-pad-cont">
                        <div className="loading-loaded"
                             style={{width: loadedWidth+'px'}}>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    show(currentValue, maxValue) {
        this.setState({
            shown: true,
            currentValue: currentValue,
            maxValue: maxValue
        });
    }

    hide() {
        this.setState({
            shown: false
        });
    }
}

export default LoadingIndicator;
