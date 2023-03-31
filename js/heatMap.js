class HeatMap {

    /**
     * Class constructor with initial configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data, _chart_id) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: 380,
        containerHeight: 300,
        margin: _config.margin || {top: 30, right: 20, bottom: 100, left: 130}
      }
      this.data = _data;
      this.chart_id = _chart_id;
      // this.colors = [
      //   "#dddddd", "#7bb3d1", "#016eae",
      //   "#dd7c8a", "#8d6c8f", "#4a4779",
      //   "#cc0024", "#8a274a", "#4b264d"
      // ];
      
      this.initVis();
    }
    
    initVis() {
      let vis = this;
  
      // Calculate inner chart size. Margin specifies the space around the actual chart.
      vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
      vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

      // // filter out data points where there was no response
      // vis.data = vis.data.filter(d => {
      //   let responded_sex_freq = d.w6_sex_frequency != "" && d.w6_sex_frequency != "Refused";
      //   let responded_religious = d.ppp20072 != "" && d.ppp20072 != "Refused";
      //   let has_cohab_value = d.cohab_before_marriage != "";
      //   return responded_sex_freq && responded_religious && has_cohab_value;
      // });

      // group by cohabitation before marriage
      // vis.cohabit_groups = d3.groups(vis.data, d => d.cohab_before_marriage);
      // console.log(vis.cohabit_groups);

      // vis.data.forEach(d => {
      //   //d.cohabit = d.S1 == "Yes, I am Married" ? 
      //   // MOCK FOR NOW:
      //   d.CaseId = +d.CaseID;
      //   d.cohabit = d.CaseID % 2 == 0;
      // })

      vis.xScale = d3.scaleBand()
          .range([0, vis.width])
          .padding(0.02);

      vis.yScale = d3.scaleBand()
          .range([vis.height, 0])
          .padding(0.02);

      vis.colorScale = d3.scaleSequential()
          .interpolator(d3.interpolateRdPu);

      vis.xAxis = d3.axisBottom(vis.xScale)
          .tickSize(0)
          .tickPadding(5);

      vis.yAxis = d3.axisLeft(vis.yScale)
          .tickSize(0)
          .tickPadding(5);

      vis.svg = d3.select(vis.config.parentElement).append('svg')
          .attr('width', vis.config.containerWidth)
          .attr('height', vis.config.containerHeight)
          .attr('class', 'heat-map-chart')
          .attr('id', vis.chart_id);

      // // Define small multiple svgs
      // vis.svg = d3.select(vis.config.parentElement).selectAll("smallMultiple")
      //     .data(vis.cohabit_groups)
      //     .enter()
      //   .append('svg')
      //     .attr('width', vis.config.containerWidth)
      //     .attr('height', vis.config.containerHeight)
      //     .attr('id', d => `heat-map-chart-${d.cohab_before_marriage}`);

      vis.chart = vis.svg.append('g')
          .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

      // Append x-axis group
      vis.xAxisG = vis.chart.append('g')
          .attr('class', 'axis x-axis')
          .attr('transform', `translate(0,${vis.height})`);

      // Append y-axis group 
      vis.yAxisG = vis.chart.append('g')
          .attr('class', 'axis y-axis');
      
      vis.chart.append('text')
          .attr('class', 'axis-title')
          .attr('y', vis.height + 80)
          .attr('x', vis.width / 2)
          .attr('dy', '.71em')
          .style('text-anchor', 'middle')
          .text('Religious Service Attendance');

      vis.svg.append('text')
          .attr('class', 'axis-title')
          .attr('x', -vis.height/3)
          .attr('y', 5)
          .attr('dy', '.71em')
          .attr("transform", "rotate(270)")
          .style('text-anchor', 'end')
          .text('Sex Frequency');

      vis.updateVis();
    }
  
  
    updateVis() {
      let vis = this;

      // vis.grouped = d3.rollup(vis.data, )

      // vis.grouped = d3.flatRollup(vis.data, v => ({count: v.length, cohabit: v.filter(x => x.cohab_before_marriage == 1).length/v.length}), d => d.ppp20072, d => d.w6_sex_frequency);
      // console.log(vis.grouped);

      vis.box_groups = d3.flatRollup(vis.data, v => v.length, d => d.ppp20072, d => d.w6_sex_frequency);
      console.log(vis.box_groups);

      // Specify x-, y-, and _____ accessor functions
      vis.xValue = d => d.ppp20072;
      vis.yValue = d => d.w6_sex_frequency;
      vis.colorValue = d => d[2];

      // Specify bivariate color accessor functions
      // vis.occurences = d => d[2].count;
      // vis.cohabit = d => d[2].cohabit;
      // vis.n = Math.floor(Math.sqrt(vis.colors.length));
      // vis.xColor = d3.scaleQuantize(d3.extent(vis.grouped, vis.occurences), d3.range(vis.n));
      // vis.yColor = d3.scaleQuantize(d3.extent(vis.grouped, vis.cohabit), d3.range(vis.n));
      // vis.color = d => vis.colors[vis.xColor(vis.occurences(d)) + vis.yColor(vis.cohabit(d)) * vis.n];


      // Set the scale input domains
      vis.xScale.domain(['Never', 'Once a year or less', 'A few times a year', 'Once or twice a month', 'Once a week', 'More than once a week']);
      vis.yScale.domain(['Once a month or less', '2 to 3 times a month', 'Once or twice a week', '3 to 6 times a week', 'Once a day or more']);
      vis.colorScale.domain(d3.extent(vis.box_groups, vis.colorValue));
      
      vis.renderVis();
    }
  
  
    renderVis() {
      let vis = this;

      // group data by sex/religion combo then count how many data points under each
      // let group = d3.groups(vis.data, d => d.ppp20072, d => d.w6_sex_frequency);
      // console.log(group);
      // let roll = d3.rollup(group, v => v.length, d => d[1][0]);
      // console.log(roll);

      let boxes = vis.chart.selectAll('.box')
          .data(vis.box_groups)
        .join('rect')
          .attr('class', 'box')
          .attr('x', d => vis.xScale(d[0]))
          .attr('y', d => vis.yScale(d[1]))
          .attr('rx', 2)
          .attr('ry', 2)
          .attr('width', vis.xScale.bandwidth())
          .attr('height', vis.yScale.bandwidth())
          .style('fill', d => vis.colorScale(vis.colorValue(d)));
          // .style("stroke-width", 4)
          // .style("stroke", "none");

      vis.xAxisG.call(vis.xAxis).selectAll(".tick text")  
          .attr("transform", "rotate(320)")
          .style("text-anchor", "end");
      vis.yAxisG.call(vis.yAxis);
    }

  
}