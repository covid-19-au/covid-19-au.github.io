/**
 * Series object which contains only one list for echarts to display data
 */
class SeriesObj {
  constructor() {
    this.list = [];
  }

  /**
   * @param {SubSeriesObj} subSeries series object which hold data for different dataset
   */
  addSubSeries(subSeries) {
    this.list.push(subSeries);
  }

  /**
   * get the whole series list
   */
  getSeriesList() {
    return this.list;
  }

  /**
   * set series list
   * @param {Array} list series list
   */
  setSeriesList(list) {
    this.list = list;
  }
}

/**
 * Sub-series object which contains name and data for an object in Series
 */
class SubSeriesObj {
  constructor(name, data) {
    this.name = name;
    this.data = data;
    this.itemStyle = {};
  }

  /**
   * set color for graph
   * @param {String} color color code
   */
  setItemStyle(color) {
    this.itemStyle["color"] = color;
  }
}

/**
 * Subseries for line chart
 */
class LineSeriesObj extends SubSeriesObj {
  constructor(name, data) {
    super(name, data);
    this.type = "line";
  }
}

/**
 * Subseries for bar chart
 */
class BarSeriesObj extends SubSeriesObj {
  constructor(name, data) {
    super(name, data);
    this.type = "bar";
  }
}

/**
 * Subseries for pie chart
 */
class PieSeriesObj extends SubSeriesObj {
  constructor(name, data) {
    super(name, data);
    this.type = "pie";
    this.isDoughnut = false;
    this.radius = 0;
  }

  /**
   * set radius for pie and check if the chart is a doughnut chart or not.
   * @param {int|String} innerRadius inner radius for a pie chart
   * @param {int|String} outerRadius outer radius for a pie chart
   */
  setRadius(innerRadius, outerRadius) {
    if (innerRadius !== "0%" || innerRadius !== 0) {
      this.isDoughnut = true;
      this.label = {
        show: false,
        position: "center",
      };
      this.emphasis = {
        label: {
          show: true,
          fontWeight: "bold",
        },
      };
    }
    this.radius = [innerRadius, outerRadius];
  }
}

export const Series = SeriesObj;
export const SubSeries = SubSeriesObj;
export const LineSeries = LineSeriesObj;
export const BarSeries = BarSeriesObj;
export const PieSeries = PieSeriesObj;

export default SeriesObj;
