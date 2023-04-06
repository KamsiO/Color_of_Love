let varForFilteringcirclesChart = "";
let currcirclesChartMainCategory = ""; // the relationship ranking
let currcirclesChartSubCategory = ""; // whether the person is part of an interracial couple
let data;
let relationshipRanking = d => d.Q34;
let whetherInterracialOfSameRace = d => d.interracial_5cat;



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
d3.csv('data/dating.csv').then(_data => {
    data = _data;
    
    // Global data processing
    data.forEach(d => {
        if(d.w6_subject_race == d.w6_q6b){
            d.interracial_5cat = "no";
        } else {
            d.interracial_5cat = "yes";
        }
        // if(relationshipRanking(d) !="" || vis.relationshipRanking(d) != "Refused" || vis.whetherPartOfInterracialCouple(d) != "") {
        //     return d;
        // }
    });

    // initialize visualizations
    dotmatrix = new DotMatrix({
        parentElement: '#DotMatrixChart',
    }, data);


    barChart = new BarChart({
        parentElement: '#bar-chart-plot',
    }, data);

    const treeMap = new TreeMap(
        {
            parentElement: "#tree-map",
        },
        data
    );

    const heatMap = new HeatMap({
        parentElement: '#heat-map',
    }, data);
});


/**
 * filter the data rendered in the bubble chart according to:
 * @param mainCategory the relationship ranking
 * @param subCategory bar clidked (interracial or same race)
 */
function filterDotMatrixChartData(){
    let filteredData = dotmatrix.sampledData.filter(d => (relationshipRanking(d) == currcirclesChartMainCategory) && (whetherInterracialOfSameRace(d) == currcirclesChartSubCategory));
    console.log(filteredData);
    dotmatrix.highlightedData = filteredData;
    dotmatrix.updateVis();

}

/**
 * highlights a bar that corresponds to the dot (if available) when a button is clicked
 * @param dotClicked is the dot that was clicked.
 */
function filterBarChartData(dotClicked) {
    let relationshipRankingOfPersonClicked = d => dotClicked.Q34;
    let whetherRelationshipIsInterracial = d => dotClicked.interracial_5cat
    let filteredData = barChart.data.filter(d =>  relationshipRanking(d) == relationshipRankingOfPersonClicked && whetherInterracialOfSameRace(d) == whetherRelationshipIsInterracial);
    console.log(filteredData);
    barChart.highlightedData = filteredData;    
    barChart.updateVis();
}


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
