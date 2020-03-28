var React = require('react');
var CanvasJS = require('./canvasjs.min');
CanvasJS = CanvasJS.Chart ? CanvasJS : window.CanvasJS;


CanvasJS.addColorSet("sitePalette",
	[//colorSet Array
		"#8ccfff",
		"#c11700",
		"#00aac1",
		"#00c177",
		"#004ac1",
		"#c100aa",
		"#d5c3f5",
		"#ff7e5f",
		"#80ddea"

	]);


class CanvasJSChart extends React.Component {
	static _cjsContainerId = 0
	constructor(props) {
		super(props);
		this.options = props.options ? props.options : {};
		this.containerProps = props.containerProps ? props.containerProps : { width: "100%", position: "relative" };
		this.containerProps.height = props.containerProps && props.containerProps.height ? props.containerProps.height : this.options.height ? this.options.height + "px" : "400px";
		this.chartContainerId = "canvasjs-react-chart-container-" + CanvasJSChart._cjsContainerId++;
	}
	componentDidMount() {
		//Create Chart and Render		
		this.chart = new CanvasJS.Chart(this.chartContainerId, this.options);
		this.chart.render();

		if (this.props.onRef)
			this.props.onRef(this.chart);
	}
	shouldComponentUpdate(nextProps, nextState) {
		//Check if Chart-options has changed and determine if component has to be updated
		return !(nextProps.options === this.options);
	}
	componentDidUpdate() {
		//Update Chart Options & Render
		this.chart.options = this.props.options;
		this.chart.render();
	}
	componentWillUnmount() {
		//Destroy chart and remove reference
		this.chart.destroy();
		if (this.props.onRef)
			this.props.onRef(undefined);
	}
	render() {
		//return React.createElement('div', { id: this.chartContainerId, style: this.containerProps });		
		return <div id={this.chartContainerId} style={this.containerProps} />
	}
}

var CanvasJSReact = {
	CanvasJSChart: CanvasJSChart,
	CanvasJS: CanvasJS
};

export default CanvasJSReact;