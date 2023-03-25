class BarChart {

    /**
     * Class constructor with initial configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 400,
        containerHeight: _config.containerHeight || 250,
        margin: _config.margin || {top: 25, right: 20, bottom: 40, left: 50},
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

      vis.subgroupsCategory = ["yes", "no"];


      // intialize the scale 
      vis.xScale = d3.scaleBand() // segments range into equal categories based on the num of domain
        .range([0, vis.width])
        .paddingInner(0.5);

        vis.xSubgroupScale = d3.scaleBand() // segments range into equal categories based on the num of domain
        .range([0, vis.width])
        // yes = couple is interracial
        .domain(vis.subgroupsCategory)
        .range([0, vis.xScale.bandwidth()])
        .padding(0.05)

      vis.yScale = d3.scaleLinear()
        .range([vis.height, 0]);     

      // color palette = one color per subgroup
      vis.colorScale = d3.scaleOrdinal()
      .domain(vis.subgroupsCategory)
      .range(['#e41a1c','#377eb8'])
         

      // intialize the axis
      vis.xAxis = d3.axisBottom(vis.xScale)
        .tickSizeOuter(0);

        vis.yAxis = d3.axisLeft(vis.yScale)
        .ticks(6)
        .tickSizeOuter(0);

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
      
       // Append y-axis group 
      vis.yAxisG = vis.chart.append('g')
      .attr('class', 'axis y-axis');

      // append axis titles
      vis.chart.append('text')
      .attr('class', 'axis-title')
      .attr('y', vis.height - 15)
      .attr('x', vis.width + 10)
      .attr('dy', '4em')
      .style('text-anchor', 'end')
      .text('Quality of Relationship')
      .style('font-weight', 'bold');

      vis.chart.append('text')
      .attr('class', 'axis-title')
      .attr('y', 0)
      .attr('x', vis.config.margin.left + 23)
      .style('text-anchor', 'end')
      .text('Frequency of Rank')
      .style('font-weight', 'bold');
      
      vis.updateVis();
    }
  
  
    updateVis() {
      let vis = this;
      vis.noInterracial = "no";
      vis.yesInterracial = "yes";
      vis.sameRaceCoupleColor = "blue";
      vis.interracialCoupleColor = "red";

      
      // group data by relationship ranking, 
      // and count number of occurences of each ranking.
      vis.groupedData = d3.rollup(vis.data, v => v.length, d => d.Q34, d => d.interracial_5cat);
      console.log(vis.groupedData);
           // todo: excludes the first and the last group in the groupedData
        // to exclude people with no answer, or who refused to rank
      // vis.groupedData.remove("\"\"");
      //  vis.groupedData.remove("Refused");
      vis.maxOccurenceCount = function (groupedData){

        // credit for iterator help: https://stackoverflow.com/a/55660647
        let mapValuesIterator = groupedData.values();
        let nextMapValues = mapValuesIterator.next();
        let max_num = 0
        
        while (!nextMapValues.done) {
          let currMax = 0;
          let innerMap = nextMapValues.value;

          // turn map to array: https://stackoverflow.com/a/56795800
          let innerMapAsArray = Array.from(innerMap, ([name, value]) => ({ name, value }));
          
          // console.log(innerMapAsArray);
          // console.log(innerMapAsArray[0]);
          // console.log(innerMapAsArray[0].name);

          currMax = Math.max(innerMapAsArray[0].value, innerMapAsArray[1].value);
          if( currMax > max_num) {
            max_num = currMax;
          }
          nextMapValues = mapValuesIterator.next();
        } 
        return max_num;
      }

      // console.log(vis.maxOccurenceCount(vis.groupedData));

      // Specificy x- and y-accessor functions
      vis.xValue = d => d.Q34;
      vis.yValue = d => {
        // console.log(vis.groupedData.get(d.Q34));
        return vis.groupedData.get(d.Q34);
      };
    
      vis.xScale.domain(["Very Poor", "Poor", "Fair", "Good", "Excellent"]);
      vis.yScale.domain([0,vis.maxOccurenceCount(vis.groupedData)]);

      console.log(this.yScale(23));
      vis.renderVis();
      
    }
  
  
    renderVis() {
      let vis = this;

      vis.pointsPlotted = 0;
      vis.totalPointsToPlot = 0;

      // code for bars and bar inspired from here: https://d3-graph-gallery.com/graph/barplot_grouped_basicWide.html
      const bars = vis.chart.selectAll('.bars')
          .data(vis.groupedData)
          .join("g")
          .filter(d => {
            console.log(d);
            console.log(d[0]);
            //removes those that didn't share their race 
            // data with the rank section blank and those that refused to rank
            if( d[0] != "" && d[0] != "Refused") {
              // vis.pointsPlotted += vis.groupedData.get(d);
              return d;
            }
          })
          .attr('class', 'bars')
          .attr("transform", d => {
            // console.log(d[0]);
          return `translate( ${vis.xScale(d[0])- vis.xScale.bandwidth()/2},0)`});

      const bar = bars.selectAll('.bar')
          .data (d => [d[1]])
          .join('g')
            .selectAll('g')
            .data(d => [d])
              .join ('rect')
              .attr('class', 'bar')
              .attr('x', (d, index)=>  {
                console.log(d);
                console.log(d.key);
                if (index == 0) {
                  console.log(vis.xSubgroupScale('no'));
                  return vis.xSubgroupScale('no');
                } else {
                  return vis.xSubgroupScale('yes');
                }           
              })
              .attr('y', (d, index) => {
                if (index == 0) {
                  console.log(vis.yScale(d.get('no')));
                  return vis.yScale(d.get('no'));
                } else {
                  console.log(d.get('yes'));
                  return vis.yScale(d.get('yes'));
                }
              })
              .attr('width', d => {
                // console.log(vis.xScale.bandwidth());
                return vis.xSubgroupScale.bandwidth();
              })
              .attr('height', (d, index) => {
                if (index == 0) {
                  console.log(d.get('no'));
                  return vis.height -  vis.yScale(d.get('no'));
                } else {
                  return vis.height -  vis.yScale(d.get('yes'));
                }
                return vis.yScale(d);
              })
              .attr("fill", (d, index) => {
                if(index == 0) {
                  return vis.sameRaceCoupleColor;
                } else {
                  return vis.interracialCoupleColor;
                }
              });
        


      // add text explaining how many points were used.
      document.getElementById("num-of-points-plotted").innerHTML = `${vis.pointsPlotted}/${vis.totalPointsToPlot} data points were plotted`;

      bar
        .on('mouseover', function (event,d) {
          vis.toolTipInfo(event,d);
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
        });
    
      // Update the axes because the underlying scales might have changed
      vis.xAxisG.call(vis.xAxis);
      vis.yAxisG.call(vis.yAxis);
    }



   /**
     *  displays the tooltip information
     */
   toolTipInfo(event,d) {
    let vis = this;
    let length_of_relationship = d => {
      if (d.w6_q21e_year != "" && d.w6_q21b_year != ""){

        console.log ("start year " + d.w6_q21b_year)
        console.log ("end year " + d.w6_q21e_year);
        if( d.w6_q21e_year - d.w6_q21b_year < 1) {
          return `<li>Length of relationship: less than 1 year</li>`;
        }
        return `<li>Length of relationship: ${d.w6_q21e_year - d.w6_q21b_year} + years`;
      } else {
        return ``;
      }
    }

    let still_together = d => {
      if (d.w6_q21e_year == ""){
        return `<li>Still together: True</li>`;
      } else {
        return `<li>Still together: False</li>`;
      }
    }

    let raceStr = d => {
      let result = ``;
      if (d.w6_subject_race != "") {
        result  += `<li>Race: ${d.w6_subject_race}</li>`;
      } 
      if (d.w6_q6b != "") {
        result  += `<li>Race of Partner: ${d.w6_q6b}</li>`;
      }
      return result;
    };

    let ageStr = d => {
      let result = ``;
      if (d.ppage != "") {
        result  += `<li>Age: ${d.ppage}</li>`;
      } 
      if (d.Q9 != "") {
        result  += `<li>Age of Partner: ${d.Q9}</li>`;
      } 
      return result;
    };
    

    d3.select('#tooltip')
    .style('display', 'block')
    .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
    .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
    .html(`
      <div><i>Details</i></div>
      <ul>
      <li>Category: ${d.Q34}: ${vis.groupedData.get(d.Q34)} </li> 

      ${ageStr(d)}
        ${raceStr(d)}
        <li>Met via: ____ </li> 
        ${still_together(d)}
        ${length_of_relationship(d)}
      </ul>
    `);
  }
  // w6_subject_race

  
}