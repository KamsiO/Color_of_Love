/**
 * Load data from CSV file asynchronously and render charts
 */

let treeMap, data;
d3.csv("data/dating.csv").then((_data) => {
  data = _data;
  // Convert necessary columns to numerical values
  data.forEach((d) => {
    //stub
  });

  // Global data processing

  // initialize visualizations
  const beeswarm = new BeeswarmPlot(
    {
      parentElement: "#beeswarm-plot",
    },
    data
  );

  const barChart = new BarChart(
    {
      parentElement: "#bar-chart",
    },
    data
  );

  const heatMap = new HeatMap(
    {
      parentElement: "#heat-map",
    },
    data
  );

  treeMap = new TreeMap(
    {
      parentElement: "#tree-map",
    },
    data
  );
});

// https://stackoverflow.com/questions/24193593/d3-how-to-change-dataset-based-on-drop-down-box-selection
// event listeners for the dropdown

// the flag ensures that we don't re-filter the data if we don't need to
let currSelection;
d3.selectAll("#age-group-filter-dropdown").on("change", function (e) {
  if (currSelection !== e.target.value) {
    currSelection = e.target.value;
    if (currSelection == "all") {
      treeMap.data = data;
    } else {
      treeMap.data = data.filter((d) => d.ppage === currSelection);
    }
    treeMap.updateVis();
  }
  // Check which categories are active
  //   let selectedCategory = [];
  //   d3.selectAll(".legend-btn:not(.inactive)").each(function () {
  //     selectedCategory.push(d3.select(this).attr("data-category"));
  //   });

  // Filter data accordingly and update vis

  //   treeMap.updateVis();
});
