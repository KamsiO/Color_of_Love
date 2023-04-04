let varForFilteringcirclesChart = "";
let currcirclesChartMainCategory = ""; // the relationship ranking
let currcirclesChartSubCategory = ""; // whether the person is part of an interracial couple
let data;
let relationshipRanking = d => d.Q34;
let whetherInterracialOfSameRace = d => d.interracial_5cat;



/**
 * Load data from CSV file asynchronously and render charts
 */
d3.csv('data/dating.csv').then(_data => {
    data = _data;
    
    // Global data processing
    // Convert necessary columns to numerical values
    data.forEach(d => {
        if(d.w6_subject_race == d.w6_q6b){
            d.interracial_5cat = "no";
        } else {
            d.interracial_5cat = "yes";
        }
    });

    // initialize visualizations
    dotmatrix = new DotMatrix({
        parentElement: '#DotMatrixChart',
    }, data);

    barChart = new BarChart({
        parentElement: '#bar-chart-plot',
    }, data);

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
    let filteredData = dotmatrix.sampledData.filter(d => relationshipRanking(d) == currcirclesChartMainCategory && whetherInterracialOfSameRace(d) == currcirclesChartSubCategory);
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