let varForFilteringcirclesChart = "";
let currcirclesChartMainCategory = ""; // the relationship ranking
let currcirclesChartSubCategory = ""; // the relationship ranking
let data;



/**
 * Load data from CSV file asynchronously and render charts
 */
d3.csv('data/dating.csv').then(_data => {
    data = _data;
    // Convert necessary columns to numerical values
    data.forEach(d => {
        if(d.w6_subject_race == d.w6_q6b){
            d.interracial_5cat = "no";
        } else {
            d.interracial_5cat = "yes";
        }
    });

    // Global data processing

    // initialize visualizations
    dotmatrix = new DotMatrix({
        parentElement: '#DotMatrixChart',
    }, data);

    const barChart = new BarChart({
        parentElement: '#bar-chart-plot',
    }, data);

    const heatMap = new HeatMap({
        parentElement: '#heat-map',
    }, data);

    currcirclesChartMainCategory = 'Excellent';
    currcirclesChartSubCategory = 'no';
    filterDotMatrixChartData();
});


/**
 * filter the data rendered in the bubble chart according to:
 * @param mainCategory the relationship ranking
 * @param subCategory bar clidked (interracial or same race)
 */
function filterDotMatrixChartData(){
    console.log (currcirclesChartMainCategory);
    console.log(currcirclesChartSubCategory);
    let filteredData = data.filter(d => d.Q34 == currcirclesChartMainCategory && d.interracial_5cat == currcirclesChartSubCategory);
    dotmatrix.highlightedData = filteredData;
    console.log(filteredData);
    dotmatrix.updateVis();

}