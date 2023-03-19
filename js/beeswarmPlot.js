class BeeswarmPlot {

    /**
     * Class constructor with initial configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 500,
        containerHeight: _config.containerHeight || 300,
        margin: _config.margin || {top: 25, right: 20, bottom: 20, left: 35},
        tooltipPadding: _config.tooltipPadding || 15
      }
      
      this.data = _data;

      this.initVis();
    }
    
    initVis() {
      let vis = this;
  

      // Calculate inner chart size. Margin specifies the space around the actual chart.
      vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
      vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

      // intialize the scale 
      vis.xScale = d3.scaleOrdinal()
        .range([0, vis.width])
        .domain(["Very Poor", "Poor", "Fair", "Good", "Excellent", "Refused"]);

      // intialize the axis
      vis.xAxis = d3.axisBottom(vis.xScale)
        .ticks(6)
        .tickSize(10)
        .tickPadding(10);

      // Define size of SVG drawing area
      vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

      // Append group element that will contain our actual chart 
      // and position it according to the given margin config
      vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

      // Append empty x-axis group and move it to the bottom of the chart
      vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.height})`);
      
      // append axis titles
      vis.chart.append('text')
      .attr('class', 'axis-title')
      .attr('y', vis.height - 15)
      .attr('x', vis.width + 10)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Quality of Relationship')
      .style('font-weight', 'bold');


      vis.updateVis();
    }
  
    
    updateVis() {
      let vis = this;
      vis.xValue = d => d.Q34;
      vis.interracialColour = 'blue';
      vis.nonInterracialColour = 'pink';
      
      vis.renderVis();
    }
  
  
    renderVis() {
      let vis = this;
      const circles = vis.chart.selectAll('.point')
        .data(vis.data, d => d.CaseID)
        .join('circle')
        // .filter()
        .attr('class', 'point')
        .attr('r', 5)
        .attr('cy', (d, index) => index - 10)
        .attr('cx', d => vis.xScale(vis.xValue(d)))
        .attr('fill',this.interracialColour)
        // .attr('stroke', 'black')
        // .attr('stroke-width', 2)
        .attr('fill-opacity', 1
        // d => {
        //   if (vis.activePointsIDs.includes(d.id) || vis.activePointsIDs.length == 0) {
        //     return activeOpacity;
        //   } else {
        //     return nonActiveOpacity;
        //   }
        // }
        );

      // // Tooltip event listeners
      // circles
      //     .on('mouseover', function (event,d) {
      //       let shouldShowTooltip = genderFilter.includes(d.gender) || genderFilter.length == 0;
      //       if(shouldShowTooltip){
      //         toolTipInfo(event,d);
      //       } else {            
      //         d3.select(this).classed('noInteraction', !shouldShowTooltip);
      //       }
      //     })
      //     .on('mouseleave', () => {
      //       d3.select('#tooltip').style('display', 'none');
      //     });

      // Update the axes/gridlines
      vis.xAxisG
        .call(vis.xAxis);
        // .call(g => g.select('.domain').remove());

    }

  
}