// copied from https://codesandbox.io/s/github/UBC-InfoVis/447-materials/tree/23Jan/d3-examples/d3-linked-charts-basic?file=/js/barchart.js:0-4600
class BarChart {
  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _dispatcher) {
    // Configuration object with defaults
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 260,
      containerHeight: _config.containerHeight || 300,
      margin: _config.margin || { top: 25, right: 20, bottom: 20, left: 40 },
    };
    this.data = _data;
    this.dispatcher = _dispatcher;

    this.initVis();
  }

  /**
   * Initialize scales/axes and append static elements, such as axis titles
   */
  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    // Initialize scales and axes
    // Important: we flip array elements in the y output range to position the rectangles correctly
    vis.yScale = d3.scaleLinear().range([vis.height, 0]);

    vis.xScale = d3.scaleBand().range([0, vis.width]).paddingInner(0.2);

    vis.xAxis = d3.axisBottom(vis.xScale).tickSizeOuter(0);

    vis.yAxis = d3.axisLeft(vis.yScale).ticks(6).tickSizeOuter(0);

    // Define size of SVG drawing area
    vis.svg = d3
      .select(vis.config.parentElement)
      .append("svg")
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight)
      .attr("id", "bar-chart");

    // SVG Group containing the actual chart; D3 margin convention
    vis.chart = vis.svg
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left},${vis.config.margin.top})`
      );

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart
      .append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(0,${vis.height})`);

    // Append y-axis group
    vis.yAxisG = vis.chart.append("g").attr("class", "axis y-axis");

    // Append axis title
    vis.svg
      .append("text")
      .attr("class", "axis-title")
      .attr("x", 0)
      .attr("y", 0)
      .attr("dy", ".71em")
      .text("Where they met");

    // Prepare data: count number of genders
    // const aggregatedDataMap = d3.rollups(
    //   vis.data,
    //   (v) => v.length,
    //   (d) => d.gender
    // );
    // vis.aggregatedData = Array.from(aggregatedDataMap, ([key, count]) => ({
    //   key,
    //   count,
    // }));
    // // Specific accessor functions
    // vis.xValue = (d) => d.key;
    // vis.yValue = (d) => d.count;

    // vis.staticYValue = d3.max(vis.aggregatedData, vis.yValue);
    this.updateVis();
  }

  /**
   * Prepare data and scales before we render it
   */
  updateVis() {
    let vis = this;

    // Prepare data: count number of genders
    const schoolDataMap = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) => d.hcm2017q24_school
    );

    const collegeDataMap = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) => d.hcm2017q24_college
    );

    const militaryDataMap = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) => d.hcm2017q24_mil
    );

    const churchDataMap = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) => d.hcm2017q24_church
    );
    // i fricking hate this
    const volunteerDataMap = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) => d.hcm2017q24_vol_org
    );

    const clientDataMap = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) => d.hcm2017q24_customer
    );

    const restaurantDataMap = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) => d.hcm2017q24_bar_restaurant
    );

    const partyDataMap = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) => d.hcm2017q24_party
    );

    const internetOtherDataMap = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) => d.hcm2017q24_internet_other
    );

    // dating app
    const internetDatingDataMap = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) => d.hcm2017q24_internet_dating
    );

    // instagram or smth
    const socialNetworkDataMap = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) => d.hcm2017q24_internet_soc_network
    );

    const gamingDataMap = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) => d.hcm2017q24_internet_game
    );

    const chatDataMap = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) => d.hcm2017q24_internet_chat
    );

    // internet site not dedicated to dating
    const internetSiteDataMap = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) => d.hcm2017q24_internet_org
    );

    // public place
    const publicPlaceDataMap = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) => d.hcm2017q24_public
    );

    const blindDateDataMap = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) => d.hcm2017q24_blind_date
    );

    const vacationDataMap = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) => d.hcm2017q24_vacation
    );

    // whatever this is
    const singleServeDataMap = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) => d.hcm2017q24_single_serve_nonint
    );

    const businessTripDataMap = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) => d.hcm2017q24_business_trip
    );

    const workNeighborsDataMap = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) => d.hcm2017q24_work_neighbors
    );

    const familyDataMap = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) => d.hcm2017q24_met_through_family
    );

    const friendDataMap = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) => d.hcm2017q24_met_through_friend
    );

    const neighborsDataMap = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) => d.hcm2017q24_met_through_as_nghbrs
    );

    const coworkersDataMap = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) => d.hcm2017q24_met_as_through_cowork
    );
    vis.aggregatedData;
    const mapArr = [
      schoolDataMap,
      collegeDataMap,
      militaryDataMap,
      churchDataMap,
      volunteerDataMap,
      clientDataMap,
      restaurantDataMap,
      partyDataMap,
      internetOtherDataMap,
      internetDatingDataMap,
      socialNetworkDataMap,
      gamingDataMap,
      chatDataMap,
      internetSiteDataMap,
      publicPlaceDataMap,
      blindDateDataMap,
      vacationDataMap,
      singleServeDataMap,
      businessTripDataMap,
      workNeighborsDataMap,
      
      // mutual connection
      familyDataMap,
      friendDataMap,
      neighborsDataMap,
      coworkersDataMap,
    ];
    const mergedMap = mapArr.flatMap(e => [...e])
    console.log(mergedMap)
    // Specific accessor functions
    vis.xValue = (d) => d.key;
    vis.yValue = (d) => d.count;
    // Set the scale input domains
    vis.xScale.domain(vis.aggregatedData.map(vis.xValue));
    vis.yScale.domain([0, vis.staticYValue]);

    vis.renderVis();
  }

  /**
   * Bind data to visual elements
   */
  renderVis() {
    let vis = this;

    // Add rectangles
    const bars = vis.chart
      .selectAll(".bar")
      .data(vis.aggregatedData, vis.xValue)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => vis.xScale(vis.xValue(d)))
      .attr("width", vis.xScale.bandwidth())
      .attr("height", (d) => vis.height - vis.yScale(vis.yValue(d)))
      .attr("y", (d) => vis.yScale(vis.yValue(d)))
      .attr("fill", vis.config.itemColour);
    // :( i'm sorry

    // Update axes
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);
  }
}
