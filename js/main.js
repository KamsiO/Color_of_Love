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

    });

    // Global data processing

    // initialize visualizations
    circlesChart = new circlesChart({
        parentElement: '#circles-chart-plot',
    }, data);

    const barChart = new BarChart({
        parentElement: '#bar-chart-plot',
    }, data);

    const heatMap = new HeatMap({
        parentElement: '#heat-map',
    }, data);

    currcirclesChartMainCategory = 'Excellent';
    currcirclesChartSubCategory = 'no';
    filtercirclesChartData();
});


/**
 * filter the data rendered in the bubble chart according to:
 * @param mainCategory the relationship ranking
 * @param subCategory bar clidked (interracial or same race)
 */
function filtercirclesChartData(){
    let filteredData = data.filter(d => d.Q34 == currcirclesChartMainCategory && d.interracial_5cat == currcirclesChartSubCategory);
    circlesChart.data = filteredData;
    circlesChart.updateVis();

}