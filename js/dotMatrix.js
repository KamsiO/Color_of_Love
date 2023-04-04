class DotMatrix {

    /**
     * Class constructor with initial configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 700,
        containerHeight: _config.containerHeight || 275,
        margin: _config.margin || {top: 25, right: 20, bottom: 20, left:50},
        tooltipPadding: _config.tooltipPadding || 15
      }
      
      this.highlightedData = [];
      this.data = _data;
    

      this.initVis();
    }

    sampleData() {
      let vis = this;
      // code for sampling data gotten from: https://stackoverflow.com/a/38571132
      let samplePercent = 0.20;
      let numOfSampledData = samplePercent * vis.data.length;
      const shuffled = vis.data.sort(() => 0.5 - Math.random());
      // Get sub-array of first n elements after shuffled
      vis.sampledData = shuffled.slice(0, numOfSampledData);
      // add text explaining how many points were plotted in the dot chart
      document.getElementById("num-of-points-plotted").innerHTML = `${numOfSampledData}/${vis.data.length} data points were plotted in the dot-matrix`;

    }
    
    initVis() {
      let vis = this;

      vis.countOfCouplesStillTogether = 0;
      vis.dotRadius = 5;
      vis.numOfCategories = 9;
      vis.noOfCirclesInARow = 45;

      //padding around the dots
      vis.padding = 5;
      vis.dotPaddingLeft = vis.padding;
      vis.dotPaddingRight = vis.padding;
      vis.dotPaddingTop = vis.padding;
      vis.dotPaddingBottom = vis.padding;
  
      // Set the dimensions of the canvas / graph
      vis.margin = {top: vis.dotRadius*10, right: vis.dotRadius*15, bottom: vis.dotRadius*10, left: vis.dotRadius*15};

      vis.height = vis.numberOfLines * (vis.dotRadius*2 + vis.dotPaddingBottom + vis.dotPaddingTop);
      vis.width = ((vis.dotRadius*2 + vis.dotPaddingLeft + vis.dotPaddingRight) * vis.noOfCirclesInARow);

     // name the race categories
     vis.raceCategories = ["White & Black", "Black & Native American", "Native American & Asian",
     "Asian & Other", "White & Other",  "Black & Asian", "Black & Other", "Native American & Other", "Asian & White", "Same-Race"];

      // initialize the scales
      vis.categoryScale = d3.scaleOrdinal().domain(vis.raceCategories).range([0, vis.raceCategories.length]);
      vis.colorScale = d3.scaleOrdinal()
      .range(d3.schemeCategory10)
      .domain(vis.raceCategories);
     
      // intialize the scales and axis
      vis.xScale = d3.scaleLinear().range([vis.margin.left, vis.width]);
      vis.xAxis = d3.axisBottom(vis.xScale)

      //Create SVG element
      vis.svg = d3.select("#DotMatrixChart")
        .attr("width", "100%")
        .attr("height",  "80%");

      vis.legendSvg = d3.select("#DotMatrixChartLegend")
        .attr("width", 200)
        .attr("height", 210)
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");
  
      
      // accessor functions
      vis.subjectRace = d => d.w6_subject_race;
      vis.partnerRace = d => d.w6_q6b;

      vis.preprocessData();
      // take a sample of the data
      vis.sampleData();   
      vis.updateVis();
    }
    
    
    updateVis() {
      let vis = this;


      // set domain of the scale
      vis.xScale.domain([0,vis.noOfCirclesInARow]);

      vis.handleButton();
      vis.renderVis();
    }
  
  
    renderVis() {
      let vis = this;

      vis.pointsPlotted = 0;
      vis.totalPointsToPlot = 0;
   
      vis.dataGroupedByRacialGroups = [];
      vis.groupDataByRacialGroups();
      // console.log(vis.dataGroupedByRacialGroups);


       // save sums in array in order of categories in vis.raceCategories.
       vis.arrOfRacialCategorySum = [vis.whiteAndBlackSum, vis.blackAndNativeAmericanSum,  vis.nativeAmericanAndAsianSum,
        vis.AsianAndOtherSum,  vis.WhiteAndOtherSum, vis.BlackAndAsianSum, vis.BlackAndOtherSum, vis.NativeAmericanAndOtherSum,
        vis.AsianAndWhiteSum];

        let numPoints = -1;
        let yCord = vis.dotRadius;
        let xdivisor =  Math.round(5 * vis.width / (2 * vis.dotRadius));

        vis.circleArray = vis.svg.selectAll(".circleArray")
        .data(vis.dataGroupedByRacialGroups, d => {
          // console.log(d[1]);
          return d;})
          .join("circle")
          .attr("class", "circleArray")
          .style("fill", d => {
            // console.log(d);
            return vis.getInterracialGroupColor(d);})
          .attr("opacity", d => {
            if (vis.highlightedData.length > 0 && vis.highlightedData.includes(d)){
              return 1;
            } else if (vis.highlightedData.length == 0) {
              return 1;
            } else {
              return 0.3;
            };
          })
          .attr("r", vis.dotRadius)
          .attr("cx", (d,index) => {
            return ((index * 2 * vis.dotRadius) % xdivisor) + (2 * vis.dotRadius);
          }) 
          .attr("cy",  (d,index) => {
            numPoints++;
            if(numPoints >= vis.noOfCirclesInARow) {
              yCord += 3* vis.dotRadius;
              numPoints = 0;
            }
            return yCord;
          })
          .on('mouseover', function (event,d) {
            // console.log(d[1][0]);
            vis.toolTipInfo(event,d);
          })
          .on('mouseleave', () => {
            d3.select('#tooltip').style('display', 'none');
          })
          .on('click', (event, d) => {
            filterBarChartData(d);
          });


          vis.legendItemWidth = 200;
          let xPosition = (2* vis.dotRadius);
          let yPostion = (d, index) => ((index + 1) * (4 * vis.dotRadius));
          
          vis.legend = d3.select("#DotMatrixChartLegend").selectAll(".dot-matrix-legend-circles")
          .data(vis.raceCategories, d => d)
            .join("circle")
            .attr ('class', 'dot-matrix-legend-circles')
            .attr("r", vis.dotRadius)
            .attr("cx", xPosition)
            .attr("cy", (d,index) => yPostion(d, index))
            .style("fill", (d, index)  => vis.colorScale(vis.raceCategories[index]));

          d3.select("#DotMatrixChartLegend").selectAll(".legendText")
            .data(vis.raceCategories, d => {
              // console.log(d);
              return d;})
            .join('text')
            .attr('class', "legendText")
            .attr("x", xPosition + 10)
            .attr("text-anchor",'start')
            .attr("y", (d,index) => yPostion(d, index) + 5)
            .style("font-size", vis.dotRadius*3 + "px")
            .text((d, index) => vis.raceCategories[index]);


            
    }
  
    /**
     * Handles action events for the button.
     * should resample the data when button is clicked.
     */
    handleButton(){
      let vis = this;
      const button = document.getElementById("resample-button");
      button.addEventListener("click", () => {
        // gets a new sample and render the dots
        vis.sampleData();      
        vis.updateVis();
      });

    }


/**
 * checks which interracial group a person is in and returns a unique color for that.
 */
    getInterracialGroupColor(d) {
      let vis = this;

      if (vis.subjectRace(d) == "White" && vis.partnerRace(d) == "Black or African American" || 
              vis.partnerRace(d) == "White" && vis.subjectRace(d) == "Black or African American"){
              return vis.colorScale(vis.raceCategories[0]);
          } else if(vis.subjectRace(d) == "Black or African American" && vis.partnerRace(d) == "American Indian, Aleut, or Eskimo" || 
            vis.partnerRace(d) == "Black or African American" && vis.subjectRace(d) == "American Indian, Aleut, or Eskimo"){
              return vis.colorScale(vis.raceCategories[1]);
          } else if(vis.subjectRace(d) == "American Indian, Aleut, or Eskimo" && vis.partnerRace(d) == "Asian or Pacific Islander" || 
            vis.partnerRace(d) == "American Indian, Aleut, or Eskimo" && vis.subjectRace(d) == "Asian or Pacific Islander"){
              return vis.colorScale(vis.raceCategories[2]);
          } else if(vis.subjectRace(d) == "Asian or Pacific Islander" && vis.partnerRace(d) == "Other (please specify)" || 
            vis.partnerRace(d) == "Asian or Pacific Islander" && vis.subjectRace(d) == "Other (please specify)"){
              return vis.colorScale(vis.raceCategories[3]);
          } else if(vis.subjectRace(d) == "White" && vis.partnerRace(d) == "Other (please specify)" || 
            vis.partnerRace(d) == "White" && vis.subjectRace(d) == "Other (please specify)"){
              return vis.colorScale(vis.raceCategories[4]);
          } else if(vis.subjectRace(d) == "Black or African American" && vis.partnerRace(d) == "Asian or Pacific Islander" || 
            vis.partnerRace(d) == "Black or African American" && vis.subjectRace(d) == "Asian or Pacific Islander"){
              return vis.colorScale(vis.raceCategories[5]);
          } else if(vis.subjectRace(d) == "Black or African American" && vis.partnerRace(d) == "Other (please specify)" || 
            vis.partnerRace(d) == "Black or African American" && vis.subjectRace(d) == "Other (please specify)"){
              return vis.colorScale(vis.raceCategories[6]);
          } else if(vis.subjectRace(d) == "American Indian, Aleut, or Eskimo" && vis.partnerRace(d) == "Other (please specify)" || 
            vis.partnerRace(d) == "American Indian, Aleut, or Eskimo" && vis.subjectRace(d) == "Other (please specify)"){
              return vis.colorScale(vis.raceCategories[7]);
          } else if(vis.subjectRace(d) == "Asian or Pacific Islander" && vis.partnerRace(d) == "White" || 
            vis.partnerRace(d) == "Asian or Pacific Islander" && vis.subjectRace(d) == "White"){
              return vis.colorScale(vis.raceCategories[8]);
          } else {
            return vis.colorScale("Same-Race");

          }
    }


    /**
     * Group the sample data by which racial group pairs (of subject and their partner) each data falls into.
     */
    groupDataByRacialGroups() {
      let vis = this;
     
      // grouping datapoints by the couple's races
      let countWhiteAndBlack = [];
      let countBlackAndNativeAmerican = [];
      let countNativeAmericanAndAsian = [];
      let countAsianAndOther = [];
      let countWhiteAndOther = [];
      let countBlackAndAsian = [];
      let countBlackAndOther = [];
      let countNativeAmericanAndOther = [];
      let countAsianAndWhite = [];
      let countSameRace = [];

      vis.sampledData.forEach(d => {

          if (vis.subjectRace(d) == "White" && vis.partnerRace(d) == "Black or African American" || 
              vis.partnerRace(d) == "White" && vis.subjectRace(d) == "Black or African American"){
              countWhiteAndBlack.push(d);
          } else if(vis.subjectRace(d) == "Black or African American" && vis.partnerRace(d) == "American Indian, Aleut, or Eskimo" || 
            vis.partnerRace(d) == "Black or African American" && vis.subjectRace(d) == "American Indian, Aleut, or Eskimo"){
              countBlackAndNativeAmerican.push(d);
          } else if(vis.subjectRace(d) == "American Indian, Aleut, or Eskimo" && vis.partnerRace(d) == "Asian or Pacific Islander" || 
            vis.partnerRace(d) == "American Indian, Aleut, or Eskimo" && vis.subjectRace(d) == "Asian or Pacific Islander"){
              countNativeAmericanAndAsian.push(d);
          } else if(vis.subjectRace(d) == "Asian or Pacific Islander" && vis.partnerRace(d) == "Other (please specify)" || 
            vis.partnerRace(d) == "Asian or Pacific Islander" && vis.subjectRace(d) == "Other (please specify)"){
              countAsianAndOther.push(d);
          } else if(vis.subjectRace(d) == "White" && vis.partnerRace(d) == "Other (please specify)" || 
            vis.partnerRace(d) == "White" && vis.subjectRace(d) == "Other (please specify)"){
              countWhiteAndOther.push(d);
          } else if(vis.subjectRace(d) == "Black or African American" && vis.partnerRace(d) == "Asian or Pacific Islander" || 
            vis.partnerRace(d) == "Black or African American" && vis.subjectRace(d) == "Asian or Pacific Islander"){
              countBlackAndAsian.push(d);
          } else if(vis.subjectRace(d) == "Black or African American" && vis.partnerRace(d) == "Other (please specify)" || 
            vis.partnerRace(d) == "Black or African American" && vis.subjectRace(d) == "Other (please specify)"){
              countBlackAndOther.push(d);
          } else if(vis.subjectRace(d) == "American Indian, Aleut, or Eskimo" && vis.partnerRace(d) == "Other (please specify)" || 
            vis.partnerRace(d) == "American Indian, Aleut, or Eskimo" && vis.subjectRace(d) == "Other (please specify)"){
              countNativeAmericanAndOther.push(d);
          } else if(vis.subjectRace(d) == "Asian or Pacific Islander" && vis.partnerRace(d) == "White" || 
            vis.partnerRace(d) == "Asian or Pacific Islander" && vis.subjectRace(d) == "White"){
              countAsianAndWhite.push(d);
          } else {
            countSameRace.push(d);
          }
      });

      vis.dataGroupedByRacialGroups = vis.dataGroupedByRacialGroups.concat(countWhiteAndBlack,countBlackAndNativeAmerican, countNativeAmericanAndAsian, 
        countAsianAndOther, countWhiteAndOther, countBlackAndAsian, countBlackAndOther, countNativeAmericanAndOther, countAsianAndWhite, countSameRace);
    }

    /**
     *  displays the tooltip information when you hover over the dots.
     */
      toolTipInfo(event,d) {
        let vis = this;  
        
        let particpantAge = d.ppage;

        d3.select('#tooltip')
        .style('display', 'block')
        .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
        .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
        .html(`
          <div><i>Details</i></div>
          <ul>
            <li>Age: ${particpantAge} </li>
            <li>Race: ${vis.subjectRace(d)} </li>
            <li>Partner's Race: ${vis.partnerRace(d)} </li>          
          </ul>
        `);
      }
  

    /**
   * Filters the data for people who left the answer blank (or refused to answer) for their race or their partner's race
   */
    preprocessData() {
      let vis = this;
      vis.data = vis.data.filter(d => vis.subjectRace(d) !="" || vis.partnerRace(d) != "" || vis.subjectRace(d) !="Other (please specify)" ||  vis.partnerRace(d) != "Other (please specify)" ||
      vis.subjectRace(d) !="Refused" ||  vis.partnerRace(d) != "Refused");
    }
  
  
  }
  
  
