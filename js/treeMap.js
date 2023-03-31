// copied from https://codesandbox.io/s/github/UBC-InfoVis/447-materials/tree/23Jan/d3-examples/d3-linked-charts-basic?file=/js/barchart.js:0-4600
class TreeMap {
  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    // Configuration object with defaults
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 400,
      containerHeight: _config.containerHeight || 300,
      margin: _config.margin || { top: 25, right: 20, bottom: 20, left: 40 },
    };
    this.data = _data;

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

    this.updateVis();
  }

  /**
   * Prepare data and scales before we render it
   */
  updateVis() {
    let vis = this;
    // education
    console.log(vis.data);

    const educationDataMap = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) => d.hcm2017q24_school === "yes" || d.hcm2017q24_college === "yes"
      // (d) => d.hcm2017q24_college
    );

    // professional
    const professionalSettingDataMap = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) =>
        d.hcm2017q24_mil === "yes" ||
        d.hcm2017q24_customer === "yes" ||
        d.hcm2017q24_vol_org === "yes" ||
        d.hcm2017q24_work_neighbors === "yes"
    );

    const socialSettingDataMap = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) =>
        d.hcm2017q24_bar_restaurant === "yes" ||
        d.hcm2017q24_party === "yes" ||
        d.hcm2017q24_public === "yes" ||
        d.hcm2017q24_church === "yes" ||
        d.hcm2017q24_single_serve_nonint === "yes" // like "singles night at the cafe"
    );

    const internetSiteDataMap = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) =>
        d.hcm2017q24_internet_other === "yes" ||
        d.hcm2017q24_internet_dating === "yes" || // dating app
        d.hcm2017q24_internet_org === "yes" // internet site not dedicated to dating
    );

    const onlineSocialNetworkingDataMap = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) =>
        d.hcm2017q24_internet_soc_network === "yes" || // instagram or smth
        d.hcm2017q24_internet_game === "yes" ||
        d.hcm2017q24_internet_chat === "yes"
    );

    const abroadDataMap = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) =>
        d.hcm2017q24_vacation === "yes" || d.hcm2017q24_business_trip === "yes"
    );

    const mutualConnectionDataMap = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) =>
        d.hcm2017q24_blind_date === "yes" || // usually blind dates get set up by someone you know
        d.hcm2017q24_met_through_family === "yes" ||
        d.hcm2017q24_met_through_friend === "yes" ||
        d.hcm2017q24_met_through_as_nghbrs === "yes" ||
        d.hcm2017q24_met_as_through_cowork === "yes"
    );
    console.log(mutualConnectionDataMap);
    vis.aggregatedData = new Map([
      // education
      ["Education", educationDataMap],

      ["Social Setting", socialSettingDataMap],

      // at work
      ["Professional Setting", professionalSettingDataMap],

      // internet site (dating or otherwise)
      ["Internet Website", internetSiteDataMap],

      // online social networking
      ["Online Social Networking", onlineSocialNetworkingDataMap],

      // abroad
      ["Abroad", abroadDataMap],

      // mutual connection
      ["Mutual Connection", mutualConnectionDataMap],
    ]);

    console.log(vis.aggregatedData);
    vis.nodes = [];
    vis.nodes.push({ name: "root", parent: null, value: null });
    // https://www.hackinbits.com/articles/js/how-to-iterate-a-map-in-javascript---map-part-2

    for (let [key, value] of vis.aggregatedData.entries()) {
      vis.nodes.push({
        name: key,
        parent: "root",
        value: value.length > 1 ? value.sort()[1][1] : 0,
      });
    }

    console.log(vis.nodes);
    vis.renderVis();
  }

  /**
   * Bind data to visual elements
   */
  renderVis() {
    let vis = this;

    // took code from https://www.students.cs.ubc.ca/~cs-436v/22Jan/fame/projects/project_g06/index.html
    // transforming data into hierarchy that can be used by the treemap
    const stratify = d3
      .stratify()
      .parentId((d) => d["parent"])
      .id((d) => d["name"]);

    // Creating treemap
    vis.root = d3.treemap().size([vis.width, vis.height]).padding(4)(
      stratify(vis.nodes)
        .sum((d) => d["value"])
        .sort((a, b) => b["value"] - a["value"])
    );

    // Drawing squares in treemap
    vis.chart
      .selectAll(".treemap-rect")
      .data(vis.root.leaves())
      .join("rect")
      .attr("class", "treemap-rect")
      .attr("x", function (d) {
        return d["x0"];
      })
      .attr("y", function (d) {
        return d["y0"];
      })
      .attr("width", function (d) {
        return d["x1"] - d["x0"];
      })
      .attr("height", function (d) {
        return d["y1"] - d["y0"];
      })
      .style("fill", "red")
      .on("mouseover", function (e, d) {
        // hovering over a treemap node shows the number of victims belonging to that group
        d3.select("#tree-map-tooltip")
          .style("display", "block")
          .style("position", "absolute")
          .style("background-color", "white")
          .style("font-family", "arial")
          .style("left", `${e.pageX + 10}px`)
          .style("top", `${e.pageY + 10}px`)
          .html(
            `<div>
                <p>How they met: ${d["id"]}</p>
                <p>Count: ${d["value"]}</p>
            </div>`
          );
      })
      .on("mouseleave", function (e, d) {
        d3.select("#tree-map-tooltip").style("display", "none");
      });
  }
}
