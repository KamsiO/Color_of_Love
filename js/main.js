/**
 * Load data from CSV file asynchronously and render charts
 */
d3.csv('data/dating.csv').then(data => {

    // Convert necessary columns to numerical values
    data.forEach(d => {

    });

    // Global data processing

    // initialize visualizations
    // const beeswarm = new BeeswarmPlot({
    //     parentElement: '#beeswarm-plot',
    // }, data);

    const barChart = new BarChart({
        parentElement: '#bar-chart-plot',
    }, data);

    const heatMap = new HeatMap({
        parentElement: '#heat-map',
    }, data);
});