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
        containerHeight: _config.containerHeight || 600,
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
      vis.xScale = d3.scaleBand() // segments range into equal categories based on the num of domain
        .range([0, vis.width])
        .domain(["Very Poor", "Poor", "Fair", "Good", "Excellent", "Refused"]);

      vis.yScale = d3.scaleLinear()
        .range([0, vis.height]);

        // search beeswarm examples, jittering algorithm
      // intialize the axis
      vis.xAxis = d3.axisBottom(vis.xScale)
        .ticks(6)
        .tickSize(10)
        .tickPadding(3);

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

      vis.radius = 4;
      // vis.padding = 1.5, // (fixed) padding between the circles
      vis.xValue = d => {
        if(d.Q34 == "" ) {
          // console.log("Refused");
          return "Refused";
        } else {
          return d.Q34;
        }
      };

      // console.log(vis.data.indexOf('Q34'));
      // console.log( vis.data[vis.data.indexOf('Q34')]);
      // console.log();

      // vis.RelationshipValues = vis.data[vis.data.indexOf('Q34')];


      // vis.arrayOfXValues = vis.RelationshipValues.map(i => vis.xScale(vis.xValue[i]));  
      // vis.arrayOfYValues = vis.dodge(vis.arrayOfXValues, vis.radius * 2 + vis.padding);
      //vis.array

      vis.yScale.domain(d3.extent(vis.data.map(d => d.CaseID)));

      vis.interracialColour = 'blue';
      vis.nonInterracialColour = 'pink';
      vis.refusedToAnswerRaceColor = 'yellow';

      
      vis.renderVis();
    }
  
  
    renderVis() {
      let vis = this;

      const circles = vis.chart.selectAll('.point')
        .data(vis.data, d => d.CaseID)
        .join('circle')
        // .filter()
        .attr('class', 'point')
        .attr('r', vis.radius)
        .attr('cy', d => vis.yScale(d.CaseID)) // (d, index) => vis.arrayOfYValues[index])
        .attr('cx', d => vis.xScale(vis.xValue(d)) + 38)
        .attr('fill', d => {
          if (d.interracial_5cat == "yes") {
            return vis.interracialColour;
          } else if (d.interracial_5cat == "no") {
            return vis.nonInterracialColour;
          } else {
            return vis.refusedToAnswerRaceColor;
          }
        })
        .attr('stroke', d => {
          if (d.Q19 == 'Yes'){
            return "black";
          } else {
            return;
          }
        })
        // .attr('stroke-width', 2)
        .attr('fill-opacity', 0.5);

        
        //credit for the simulation: https://www.chartfleau.com/tutorials/d3swarm

      let simulation = d3.forceSimulation(vis.data)
        .force("x", d3.forceX((d) => {
            return vis.xScale(vis.xValue(d) + 38);
            }).strength(0.2))
        
        .force("y", d3.forceY((d) => {
            return vis.yScale(d.CaseID);
            }).strength(-10))
        
        .force("collision", d3.forceCollide(vis.radius))

        .alphaDecay(0)
        .alpha(0.3)
        .on("tick", vis.tick(vis.xValue, vis.xScale, vis.yScale));

        setTimeout(function () {
          console.log("start alpha decay");
          simulation.alphaDecay(0.1);
          }, 3000); // start decay after 3 seconds



      // // Tooltip event listeners
      circles
          .on('mouseover', function (event,d) {
            vis.toolTipInfo(event,d);

            // let shouldShowTooltip = genderFilter.includes(d.gender) || genderFilter.length == 0;
            // if(shouldShowTooltip){
            //   toolTipInfo(event,d);
            // } else {            
            //   d3.select(this).classed('noInteraction', !shouldShowTooltip);
            // }
          })
          .on('mouseleave', () => {
            d3.select('#tooltip').style('display', 'none');
          });

      // Update the axes/gridlines
      vis.xAxisG
        .call(vis.xAxis);
        // .call(g => g.select('.domain').remove());

    }

    // controls the ticks for the force simulation on the circles
    tick(xValue, xScale, yScale) {
      d3.selectAll(".point")
        .attr("cx", d => xScale(xValue(d)) + 38)
        .attr("cy",  d => yScale(d.CaseID));

      // d3.selectAll(".point")
      //   .attr("cx", d => d.x)
      //   .attr("cy",  d => d.y);
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
            ${ageStr(d)}
            ${raceStr(d)}
            <li>Met via: ____ </li> 
            ${still_together(d)}
            ${length_of_relationship(d)}
          </ul>
        `);
      }
      w6_subject_race







  }


  /**
   * for the simulation. credit: https://www.d3indepth.com/force-layout/
   */

          // var width = 300, height = 300
        // var nodes = vis.data;

        // var simulation = d3.forceSimulation(nodes)
        //   .force('charge', d3.forceManyBody())
        //   .force('center', d3.forceCenter(width / 2, height / 2))
        //   .on('tick', ticked);

        // function ticked() {
        //   var u = d3.select('svg')
        //     .selectAll('circle')
        //     .data(nodes)
        //     .join('circle')
        //     .attr('r', 5)
        //     .attr('cx', function(d) {
        //       return d.x
        //     })
        //     .attr('cy', function(d) {
        //       return d.y
        //     });
        // }
        // // var xCenter = [100, 300, 500];

        // var simulation = d3.forceSimulation(nodes)
        // .force('charge', d3.forceManyBody().strength(40))
        // .force('x', d3.forceX().x(function(d) {
        //   return vis.xScale(vis.xValue(d) + 38);
        // }))
        // .force('y', d3.forceY().y(function(d) {
        //   return vis.yScale(d.CaseID);
        // }))
        // .force('collision', d3.forceCollide().radius(function(d) {
        //   return d.radius;
        // }));


        // var simulation = d3.forceSimulation(circles)
        // .force('charge', d3.forceManyBody().strength(5))
        // .force('x', d3.forceX().x(function(d) {
        //   return vis.xScale(vis.xValue(d) + 38);
        // }))
        // .force('y', d3.forceY().y(function(d) {
        //   return vis.yScale(d.CaseID);
        // }))
        // .force('collision', d3.forceCollide().radius(vis.radius));