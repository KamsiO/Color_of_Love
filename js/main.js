
const MEETING_METHODS = {
    0: "Education",
    1: "Professional Setting",
    2: "Social Setting",
    3: "Internet Website",
    4: "Online Social Networking",
    5: "Abroad",
    6: "Mutual Connection",
};

/**
 * Load data from CSV file asynchronously and render charts
 */
let treeMap, data;
d3.csv("data/dating.csv").then((_data) => {
    data = _data;
    // Convert necessary columns to numerical values
    data.forEach((d) => {
        //Global data processing stub
    });

    // initialize visualizations
    const beeswarm = new BeeswarmPlot(
        {
            parentElement: "#beeswarm-plot",
        },
        data
    );

    const treeMap = new TreeMap(
        {
            parentElement: "#tree-map",
        },
        data
    );

    const heatMap = new HeatMap({
        parentElement: '#heat-map',
    }, data);


// https://stackoverflow.com/questions/24193593/d3-how-to-change-dataset-based-on-drop-down-box-selection
// event listeners for the dropdown

// the flag ensures that we don't re-filter the data if we don't need to
let currSelection;
d3.selectAll("#age-group-filter-dropdown").on("change", function (e) {
    // Filter data accordingly and update vis

    if (currSelection !== e.target.value) {
        currSelection = e.target.value;
        if (currSelection == "all") {
            treeMap.data = data;
            heatMap.data = data;
        } else {
            treeMap.data = data.filter(function (d) {
                return d.ppagecat === currSelection;
            });
            heatMap.data = data.filter(d => d.ppagecat === currSelection);
        }
        treeMap.updateVis();
        heatMap.updateVis();
    }
});

});
