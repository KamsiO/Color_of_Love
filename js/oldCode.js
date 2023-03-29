      // the code for this view is According to https://www.students.cs.ubc.ca/~cs-436v/21Jan/fame/projects/data-breaches/index.html


class BubbleChart {

    /**
     * Class constructor with initial configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data) {
      this.config = {
        parentElement: _config.parentElement,
        // containerWidth: _config.containerWidth || 1190,
        // containerHeight: _config.containerHeight || 750,
        containerWidth: _config.containerWidth || 675,
        containerHeight: _config.containerHeight || 275,
        margin: _config.margin || {top: 25, right: 20, bottom: 20, left:50},
        tooltipPadding: _config.tooltipPadding || 15
      }
      
      this.data = _data;

      this.initVis();
    }
    
    initVis() {
      let vis = this;

      vis.raceCategories = ["White", "Black or African American","American Indian, Aleut, or Eskimo","Asian or Pacific Islander","Other (please specify)"];
  

      // Calculate inner chart size. Margin specifies the space around the actual chart.
      vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
      vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

      // // intialize the scale 
      // vis.xScale = d3.scaleBand() // segments range into equal categories based on the num of domain
      //   .range([-50, vis.width])
      //   .domain(["Very Poor", "Poor", "Fair", "Good", "Excellent"]);

      // vis.yScale = d3.scaleLinear()
      //   .range([0, vis.height - 50]);

      vis.radiusScale = d3.scaleSqrt().range([10, 30])
      .domain(d3.extent(vis.data, d => d.w6_q21e_year - d.w6_q21b_year));
  
      // Initialize color scale used for category coloring
      vis.colorScale = d3.scaleOrdinal()
      .domain(vis.raceCategories)
      .range(["#67D99B","#E05E5E","#9b67d9","#3f37c9","#678fd9"]);

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
      // vis.chartArea = 
      // Append empty x-axis group and move it to the bottom of the chart
      vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.height})`);
      
      // append axis title
      vis.chart.append('text')
      .attr('class', 'axis-title')
      .attr('y', vis.height - 15)
      .attr('x', vis.width + 10)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Close up')
      .style('font-weight', 'bold');

       // append view title
       vis.chart.append('text')
       .attr('class', 'axis-title')
       .attr('y', 0)
       .attr('x', 250)
       .attr('dy', '.71em')
       .style('text-anchor', 'end')
       .text( " Viewing the " + currBubbleChartSubCategory + " couples who ranked their relationship as " + currBubbleChartMainCategory)
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

      vis.interracialColour = 'blue';
      vis.nonInterracialColour = 'red';

      // Group the data based on race categories
      vis.groupedData = d3.rollup(vis.data, v => v.length, d => d.w6_subject_race);
      vis.groupedData.delete("");
      console.log(this.groupedData);

          // Create a new pack layout, encoding the pack layout’s radius accessor as the radiusScale 
        // Lays out the specified root hierarchy, assigning the x,y,r properties on root and descendants
        vis.pack = () => d3.pack()
            .size([vis.width, vis.height - 100])
            .radius(d => {
              console.log(d.value)
              return vis.radiusScale(d.value);})
            .padding(5)
        (d3.hierarchy(vis.groupedData)
            // Size code the nodes based on the recordsLost
            .sum(d => d.w6_q21e_year - d.w6_q21b_year));

        // d3.select('#story-tooltip').style('display', 'none');

      vis.renderVis();
    }
  
  
    renderVis() {
      let vis = this;
      // vis.pointsPlotted = 0;
      // vis.totalPointsToPlot = 0;

      const nodes = vis.pack().leaves();
      vis.points = nodes;

      // Creates a new simulation with our nodes
      const simulation = d3.forceSimulation(nodes)
          // Set the x and y force and strength
          .force("x", d3.forceX(400).strength(0.01))
          .force("y", d3.forceY(300).strength(0.01))
          // With custom functions for the cluster and colliding mechanisms
          .force("cluster", forceCluster())
          .force("collide", forceCollide());

          vis.circles = vis.chart
          //const node = vis.chart.append("g")
              .selectAll("circle")
              .data(nodes)
              .join("circle")
                  .attr('class', d => {
                    console.log(d);
                    console.log(d.data.w6_subject_race);
                  return d.data.w6_subject_race})
                  .attr('class', 'node')
                  .attr("cx", d => d.x)
                  .attr("cy", d => d.y)
                  .attr("r", d => d.r)
                  .attr("stroke", function(d) { 
                    // Set the stroke color of the circles by altering luminance of that color
                    let c = d3.hsl(vis.colorScale(d.data.w6_subject_race));
                    c.l -= 0.3;
                    return c})
                  .attr("stroke-width", "1.2")
                  .attr("opacity", "0.8")
                  .attr("fill", d => vis.colorScale(d.data.w6_subject_race))
                  .call(vis.drag(simulation));



        // Change the delay/duration time for annimating the nodes when rendering
        vis.circles.transition()
        .delay((d, i) => Math.random() * 500)
        .duration(750)
        .attrTween("r", d => {
          const i = d3.interpolate(0, d.r);
          return t => d.r = i(t);
        });

              // Tooltip event listeners
        vis.circles
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
  
    // Listen for tick events as the simulation runs
    // Create a bounding box on the circles to stay within svg area
    simulation.on("tick", () => {
      vis.circles
          .attr("cx", function(d) { return d.x = Math.max(60, Math.min(vis.width - 60, d.x)); })
          .attr("cy", function(d) { return d.y = Math.max(90, Math.min(vis.height - 90, d.y)); });
    });
    
       /**
         * Handles the implementation of clustering forces
         * In our case attracting each group of nodes towards a center point
         * Credit to: https://observablehq.com/d/66afec6a163e6a73
         */
       function forceCluster() {
        const strength = 0.1;
        let nodes;
      
        function force(alpha) {
          const centroids = d3.rollup(nodes, centroid, d => d.data.w6_subject_race);
          const l = alpha * strength;
          for (const d of nodes) {
            const {x: cx, y: cy} = centroids.get(d.data.w6_subject_race);
            d.vx -= (d.x - cx) * l;
            d.vy -= (d.y - cy) * l;
          }
        }
      
        force.initialize = _ => nodes = _;
      
        return force;
      }

      /**
       * Handles the implementation of a collision force 
       * Treats nodes as circles with a given radius and prevents nodes from overlapping
       * Credit to: https://observablehq.com/d/66afec6a163e6a73
       */
      function forceCollide() {
        const alpha = 0.3; 
        // Separation between same cluster nodes
        const padding1 = 2.6; 
        // separation between different cluster nodes
        const padding2 = 15; 
        let nodes;
        let maxRadius;
      
        function force() {
            const quadtree = d3.quadtree(nodes, d => d.x, d => d.y);
            for (const d of nodes) {
            const r = d.r + maxRadius;
            const nx1 = d.x - r, ny1 = d.y - r;
            const nx2 = d.x + r, ny2 = d.y + r;
            quadtree.visit((q, x1, y1, x2, y2) => {
                if (!q.length) do {
                if (q.data !== d) {
                    const r = d.r + q.data.r + (d.data.sector === q.data.data.w6_subject_race ? padding1 : padding2);
                    let x = d.x - q.data.x, y = d.y - q.data.y, l = Math.hypot(x, y);
                    if (l < r) {
                    l = (l - r) / l * alpha;
                    d.x -= x *= l, d.y -= y *= l;
                    q.data.x += x, q.data.y += y;
                    }
                }
                } while (q = q.next);
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
            }
        }
      
        force.initialize = _ => maxRadius = d3.max(nodes = _, d => d.r) + Math.max(padding1, padding2);
      
        return force;
      }
    
      /**
       * Handles implementation of a weighted center of each group of nodes 
       * Helper for ForceCluster to attract nodes to a center point
       * Credit to: https://observablehq.com/d/66afec6a163e6a73
       */
      function centroid(nodes) {
        let x = 0;
        let y = 0;
        let z = 0;
        for (const d of nodes) {
          let k = d.r ** 2;
          x += d.x * k;
          y += d.y * k;
          z += k;
        }
        return {x: x / z, y: y / z};
      }
}

/**
 * Handles dragging of the nodes (drag and dropping)
 */
drag(simulation) {

    function dragstarted(event, d) {
      // Restarts the simulation’s internal timer and returns the simulation
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event, d) {
      // Update as we drag
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event, d) {
      // Sets the alpha to zero, simulation has stopped, return simulation
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    // Bind the necessary event listeners for dragging
    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
  }  


// /** my old circle code */
//       const circles = vis.chart.selectAll('.point')
//         .data(vis.data, d => {
//           // vis.totalPointsToPlot += 1;
//           return d.CaseID; 
//         } )
//         .join('circle')
//         .filter(d => {
//           if(d.interracial_5cat != "" && d.Q34 != "") {
//             // vis.pointsPlotted += 1;
//             return d;
//           }
//         })
//         .attr('class', 'point')
//         .attr('r', vis.radius)
//         .attr('cy', d => vis.yScale(d.CaseID)) // (d, index) => vis.arrayOfYValues[index])
//         .attr('cx', d => vis.xScale(d.Q34))
//         .attr('fill', d => {
//           if (d.interracial_5cat == "yes") {
//             return vis.interracialColour;
//           } else if (d.interracial_5cat == "no") {
//             return vis.nonInterracialColour;
//           } else {
//             return vis.refusedToAnswerRaceColor;
//           }
//         })
//         .attr('stroke', d => {
//           if (d.Q19 == 'Yes'){
//             return "black";
//           } else {
//             return;
//           }
//         })
//         // .attr('stroke-width', 2)
//         .attr('fill-opacity', 0.5);

//     /** my old circle code */
    
      // add text explaining how many points were used.
      // document.getElementById("num-of-points-plotted").innerHTML = `${vis.pointsPlotted}/${vis.totalPointsToPlot} data points were plotted`;

        //credit for the simulation: https://www.chartfleau.com/tutorials/d3swarm

    // let simulation = d3.forceSimulation(vis.data)
    //       .force("x", d3.forceX((d) => {
    //         // console.log(d);
    //         // console.log(vis.xValue(d));
    //           return vis.xScale(d.Q34) + 30;
    //           }).strength(0.020))
          
    //       .force("y", d3.forceY((d) => {
    //           return vis.height/2 + vis.height/7 ;
    //           }).strength(0.050))
          
    //       .force("collision", d3.forceCollide(vis.radius))

    //       // .alphaDecay(0)
    //       // .alpha(0.3)
    //       .on("tick", vis.tick);

    //       setTimeout(function () {
    //         console.log("start alpha decay");
    //         simulation.alphaDecay(0.1);
    //         }, 500); // start decay after 3 seconds
      



    


    // /**
    //  * controls the ticks for the force simulation on the circles
    //  */
    // tick() {
    //   d3.selectAll(".point")
    //     .attr("cx", d => d.x)
    //     .attr("cy",  d => d.y);
    // }


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


  }
