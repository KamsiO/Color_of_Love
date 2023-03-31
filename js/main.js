/**
 * Load data from CSV file asynchronously and render charts
 */
d3.csv('data/dating.csv').then(data => {

    // Convert necessary columns to numerical values
    data.forEach(d => {

    });

    // Global data processing

    // initialize visualizations
    const beeswarm = new BeeswarmPlot({
        parentElement: '#beeswarm-plot',
    }, data);

    const barChart = new BarChart({
        parentElement: '#bar-chart',
    }, data);



    // filter out data points where there was no response
    heatmap_data = data.filter(d => {
        let responded_sex_freq = d.w6_sex_frequency != "" && d.w6_sex_frequency != "Refused";
        let responded_religious = d.ppp20072 != "" && d.ppp20072 != "Refused";
        let has_cohab_value = d.cohab_before_marriage != "";
        return responded_sex_freq && responded_religious && has_cohab_value;
    });

    const heatMap = new HeatMap({
        parentElement: '#heat-map',
    }, heatmap_data);
});