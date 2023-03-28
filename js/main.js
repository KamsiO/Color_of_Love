let varForFilteringBubbleChart = "";
let data;
// let bubbleChart; 


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
    let bubbleChart = new BubbleChart({
        parentElement: '#bubble-chart-plot',
    }, data);

    const barChart = new BarChart({
        parentElement: '#bar-chart-plot',
    }, data);

    const heatMap = new HeatMap({
        parentElement: '#heat-map',
    }, data);

    let defaultCategory = 'Excellent';
    let defaultSubCategory = 'yes';
    filterBubbleChartData(defaultCategory,defaultSubCategory);
});


/**
 * filter the data rendered in the bubble chart according to:
 * @param mainCategory
 * @param subCategory
 */
function filterBubbleChartData(mainCategory,subCategory){
    let filteredData = data.filter(d => d.Q34 == mainCategory && d.interracial_5cat == subCategory);
    bubbleChart.data = filteredData;
    bubbleChart.updateVis();

}