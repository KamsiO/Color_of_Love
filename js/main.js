let varForFilteringBubbleChart = "";
let currBubbleChartMainCategory = ""; // the relationship ranking
let currBubbleChartSubCategory = ""; // the relationship ranking
let data;
let bubbleChart; 


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
    bubbleChart = new BubbleChart({
        parentElement: '#bubble-chart-plot',
    }, data);

    const barChart = new BarChart({
        parentElement: '#bar-chart-plot',
    }, data);

    const heatMap = new HeatMap({
        parentElement: '#heat-map',
    }, data);

    currBubbleChartMainCategory = 'Excellent';
    currBubbleChartSubCategory = 'no';
    filterBubbleChartData();
});


/**
 * filter the data rendered in the bubble chart according to:
 * @param mainCategory the relationship ranking
 * @param subCategory bar clidked (interracial or same race)
 */
function filterBubbleChartData(){
    let filteredData = data.filter(d => d.Q34 == currBubbleChartMainCategory && d.interracial_5cat == currBubbleChartSubCategory);
    bubbleChart.data = filteredData;
    bubbleChart.updateVis();

}