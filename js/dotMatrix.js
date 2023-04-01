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
      let samplePercent = 0.25;
      let numOfSampledData = samplePercent * vis.data.length;
      const shuffled = vis.data.sort(() => 0.5 - Math.random());
      // Get sub-array of first n elements after shuffled
      vis.sampledData = shuffled.slice(0, numOfSampledData);
  
    }
    
    initVis() {
      let vis = this;
      // vis.minCircSize = 5;
      // vis.maxCircSize = 20;
      
      vis.countOfCouplesStillTogether = 0;

      // sums of how many couples fall into each category
      vis.whiteAndBlackSum = 0;
      vis.blackAndNativeAmericanSum = 0;
      vis.nativeAmericanAndAsianSum = 0;
      vis.AsianAndOtherSum = 0;
      vis.WhiteAndOtherSum = 0;
      vis.BlackAndAsianSum = 0;
      vis.BlackAndOtherSum = 0;
      vis.NativeAmericanAndOtherSum = 0;
      vis.AsianAndWhiteSum = 0;

      // stores the highest number of couples still together amongst all the race groupings
      vis.maxCountOfThoseStillTogether = 0;


      vis.dotRadius = 5;
      vis.numOfCategories = 9;
      vis.noOfCirclesInARow = 45;

      vis.uniqueGroups = ['apple'];
      vis.maxNoOfLinesInGroup = 100;

      vis.numberOfLines = vis.maxNoOfLinesInGroup * vis.uniqueGroups.length;

      vis.padding = 5;
      vis.dotPaddingLeft = vis.padding;
      vis.dotPaddingRight = vis.padding;
      vis.dotPaddingTop = vis.padding;
      vis.dotPaddingBottom = vis.padding;
  
      // // Calculate inner chart size. Margin specifies the space around the actual chart.
      // vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
      // vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

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
     
      // intialize the scales
        // Set the ranges
      vis.xScale = d3.scaleLinear().range([vis.margin.left, vis.width]);
      vis.yScale = d3.scaleLinear().range([vis.height, 0]);

      vis.xAxis = d3.axisBottom(vis.xScale)

      // vis.yAxis = d3.axisLeft(vis.yScale)
      //     .tickFormat( d => vis.uniqueGroups[d])
      //     .ticks(vis.uniqueGroups.length)
      //     .tickSize(-vis.width + vis.margin.left-(vis.dotRadius*2), 0, 0);

      //Create SVG element
      vis.svg = d3.select("#DotMatrixChart")
        .append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height",  vis.height + vis.margin.top + vis.margin.bottom)
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");
      // takes a sample of the data
      vis.sampleData();      
      vis.updateVis();
    }
  
    
    updateVis() {
      let vis = this;

      vis.subjectRace = d => d.w6_subject_race;
      vis.partnerRace = d => d.w6_q6b;

  


      vis.groupedDataArr = d3.groups(vis.sampledData, d => d.CaseID);

      vis.xScale.domain([0,vis.noOfCirclesInARow]);
      // vis.yScale.domain([0,1]);
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
            // console.log((index * 2 * vis.dotRadius) % xdivisor);
            return ((index * 2 * vis.dotRadius) % xdivisor) + (2 * vis.dotRadius);
          }) 
          .attr("cy",  (d,index) => {
            numPoints++;
            if(numPoints >= vis.noOfCirclesInARow) {
              // console.log(numPoints);
              // console.log(vis.noOfCirclesInARow);
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

          // // add legend
          // vis.legend = d3.select(".dot-chart-legend")
          // .data(vis.raceCategories, d => d)
          // .join("g")
          // .attr("class", "dot-chart-legend")
          // .attr("transform", "translate(" + 0  + "," + (vis.margin.top+vis.dotRadius) + ")");

          vis.xPosition = (d, index) => (index* 4);
          vis.yPostion = d => vis.height/4;
          
          vis.legend = d3.select("#DotMatrixChartLegend").selectAll(".dot-matrix-legend-circles")
          .data(vis.raceCategories, d => d)
          // .join("g")
          // .attr("class", "dot-chart-legend")
          // .attr("transform", "translate(" + 0  + "," + (vis.margin.top+vis.dotRadius) + ")");
          .data(vis.raceCategories, d => d)
            .join("circle")
            .attr ('class', 'dot-matrix-legend-circles')
            .attr("r", vis.dotRadius)
            .attr("cx", (d,index)  => {
              return vis.xPosition(d,index); })
            .attr("cy", d => vis.yPostion(d))
            .style("fill", (d, index)  => vis.colorScale(vis.raceCategories[index]));

          vis.legend
            .selectAll(".legendText")
            .join('text')
            .attr('class', "legendText")
            .attr("x", d => vis.xPosition(d))
            .attr("text-anchor",'start')
            .attr("y", d => vis.yPostion(d))
            .style("font-size", vis.dotRadius*3 + "px")
            .text((d, index) => vis.raceCategories[index]);


            
    }
  
    /**
     * Handles action events for the button.
     * should resample the data when called.
     */
    handleButton(){
      let vis = this;
      const button = document.getElementById("resample-button");
      // button.addEventListener('mouseover', function (event) {
      //   d3.select(this).attr("class", "button-hover");
      // });
    //  button.addEventListener('mouseleave', () => {
    //     d3.select('#tooltip').style('display', 'none');
    //   });
      button.addEventListener("click", () => {
        vis.initVis();
      });

    }
/**
 * checks which interracial group a person is in
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
     * For each circle, count how many couples in the circle are still together
     */
    groupDataByRacialGroups() {
      let vis = this;
      // let arrOfCouplesTogether = vis.data.filter(d => d.partnership_status == 1 || d.partnership_status == 2);
     
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

        // console.log(countWhiteAndBlack);
        // console.log(countBlackAndNativeAmerican);
        // console.log(countNativeAmericanAndAsian);
        // console.log(countAsianAndOther);
        // console.log(countWhiteAndOther);
        // console.log(countBlackAndAsian);
        // console.log(countBlackAndOther);
        // console.log(countNativeAmericanAndOther);
        // console.log(countAsianAndWhite);
        // console.log(countSameRace);


      vis.dataGroupedByRacialGroups = vis.dataGroupedByRacialGroups.concat(countWhiteAndBlack,countBlackAndNativeAmerican, countNativeAmericanAndAsian, 
        countAsianAndOther, countWhiteAndOther, countBlackAndAsian, countBlackAndOther, countNativeAmericanAndOther, countAsianAndWhite, countSameRace);
    }


    // /**
    //  * For each circle, count how many couples in the circle are still together
    //  */
    // updateCountOfCouplesStillTogether() {
    //   let vis = this;
    //   // let arrOfCouplesTogether = vis.data.filter(d => d.partnership_status == 1 || d.partnership_status == 2);
     
    //   let countWhiteAndBlackStillTogether = 0;
    //   let countBlackAndNativeAmericanStillTogether = 0;
    //   let countNativeAmericanAndAsianStillTogether = 0;
    //   let countAsianAndOtherStillTogether = 0;
    //   let countWhiteAndOtherStillTogether = 0;
    //   let countBlackAndAsianStillTogether = 0;
    //   let countBlackAndOtherStillTogether = 0;
    //   let countNativeAmericanAndOtherStillTogether = 0;
    //   let countAsianAndWhiteStillTogether = 0;

    //   for (let i = 0; i < vis.groupedDataArr.length; i++){
    //     let subject_race = vis.groupedDataArr[i][0];

    //     for (let j = 0; j < vis.groupedDataArr[i][1].length; j++){
    //       let subject_partner_race = vis.groupedDataArr[i][1][j][0];

    //       if (subject_race == "White" && subject_partner_race == "Black or African American" || 
    //           subject_partner_race == "White" && subject_race == "Black or African American"){
    //           countWhiteAndBlackStillTogether = vis.CountThoseTogetherInEachRaceCategory(subject_race, subject_partner_race);
    //       } else if(subject_race == "Black or African American" && subject_partner_race == "American Indian, Aleut, or Eskimo" || 
    //         subject_partner_race == "Black or African American" && subject_race == "American Indian, Aleut, or Eskimo"){
    //           countBlackAndNativeAmericanStillTogether = vis.CountThoseTogetherInEachRaceCategory(subject_race, subject_partner_race);
    //       } else if(subject_race == "American Indian, Aleut, or Eskimo" && subject_partner_race == "Asian or Pacific Islander" || 
    //         subject_partner_race == "American Indian, Aleut, or Eskimo" && subject_race == "Asian or Pacific Islander"){
    //           countNativeAmericanAndAsianStillTogether = vis.CountThoseTogetherInEachRaceCategory(subject_race, subject_partner_race);
    //       } else if(subject_race == "Asian or Pacific Islander" && subject_partner_race == "Other (please specify)" || 
    //         subject_partner_race == "Asian or Pacific Islander" && subject_race == "Other (please specify)"){
    //           countAsianAndOtherStillTogether = vis.CountThoseTogetherInEachRaceCategory(subject_race, subject_partner_race);
    //       } else if(subject_race == "White" && subject_partner_race == "Other (please specify)" || 
    //         subject_partner_race == "White" && subject_race == "Other (please specify)"){
    //           countWhiteAndOtherStillTogether = vis.CountThoseTogetherInEachRaceCategory(subject_race, subject_partner_race);
    //       } else if(subject_race == "Black or African American" && subject_partner_race == "Asian or Pacific Islander" || 
    //         subject_partner_race == "Black or African American" && subject_race == "Asian or Pacific Islander"){
    //           countBlackAndAsianStillTogether = vis.CountThoseTogetherInEachRaceCategory(subject_race, subject_partner_race);
    //       } else if(subject_race == "Black or African American" && subject_partner_race == "Other (please specify)" || 
    //         subject_partner_race == "Black or African American" && subject_race == "Other (please specify)"){
    //           countBlackAndOtherStillTogether = vis.CountThoseTogetherInEachRaceCategory(subject_race, subject_partner_race);
    //       } else if(subject_race == "American Indian, Aleut, or Eskimo" && subject_partner_race == "Other (please specify)" || 
    //         subject_partner_race == "American Indian, Aleut, or Eskimo" && subject_race == "Other (please specify)"){
    //           countNativeAmericanAndOtherStillTogether = vis.CountThoseTogetherInEachRaceCategory(subject_race, subject_partner_race);
    //       } else if(subject_race == "Asian or Pacific Islander" && subject_partner_race == "White" || 
    //         subject_partner_race == "Asian or Pacific Islander" && subject_race == "White"){
    //           countAsianAndWhiteStillTogether = vis.CountThoseTogetherInEachRaceCategory(subject_race, subject_partner_race);
    //       }
    //     }
    //   }

    //   vis.arrOfCountOfCouplesStillTogether = [countWhiteAndBlackStillTogether, countBlackAndNativeAmericanStillTogether, 
    //     countNativeAmericanAndAsianStillTogether, countAsianAndOtherStillTogether, countWhiteAndOtherStillTogether, countBlackAndAsianStillTogether,
    //     countBlackAndOtherStillTogether, countNativeAmericanAndOtherStillTogether, countAsianAndWhiteStillTogether];
    // }

  //   /**
  //    * 
  //    * @param {*} subject_race race of the person interviewed
  //    * @param {*} subject_partner_race race of the interviewee's partner
  //    * @returns 
  //    */
  //   CountThoseTogetherInEachRaceCategory(subject_race, subject_partner_race) {
  //     let vis = this;
  //     let tempData = vis.data;
  //     let couplesOfSpecifiedRace = tempData.filter(d => (vis.subjectRace(d) == subject_race && vis.partnerRace(d) == subject_partner_race
  //       && (d => d.partnership_status == 1 || d.partnership_status == 2)));
  //       if(vis.maxCountOfThoseStillTogether < couplesOfSpecifiedRace.length) vis.maxCountOfThoseStillTogether = couplesOfSpecifiedRace.length;
  //     return couplesOfSpecifiedRace.length;
  //   }

  //   /**
  //    * Counts how many couples are in each of the 9 racial combos
  //    * and stores the count in the corresponding array
  //    */
  //   updateCountOfRacialGroups () {
  //     let vis = this;

  //     for (let i = 0; i < vis.groupedDataArr.length; i++){
  //       let subject_race = vis.groupedDataArr[i][0];

  //       for (let j = 0; j < vis.groupedDataArr[i][1].length; j++){
  //         let subject_partner_race = vis.groupedDataArr[i][1][j][0];
  //         if (subject_race == "White" && subject_partner_race == "Black or African American" || 
  //           subject_partner_race == "White" && subject_race == "Black or African American"){
  //             vis.whiteAndBlackSum += vis.groupedDataArr[i][1][j][1];
  //         } else if(subject_race == "Black or African American" && subject_partner_race == "American Indian, Aleut, or Eskimo" || 
  //         subject_partner_race == "Black or African American" && subject_race == "American Indian, Aleut, or Eskimo"){
  //           vis.blackAndNativeAmericanSum += vis.groupedDataArr[i][1][j][1];
  //         } else if(subject_race == "American Indian, Aleut, or Eskimo" && subject_partner_race == "Asian or Pacific Islander" || 
  //           subject_partner_race == "American Indian, Aleut, or Eskimo" && subject_race == "Asian or Pacific Islander"){
  //             vis.nativeAmericanAndAsianSum += vis.groupedDataArr[i][1][j][1];
  //         } else if(subject_race == "Asian or Pacific Islander" && subject_partner_race == "Other (please specify)" || 
  //           subject_partner_race == "Asian or Pacific Islander" && subject_race == "Other (please specify)"){
  //             vis.AsianAndOtherSum += vis.groupedDataArr[i][1][j][1];
  //         } else if(subject_race == "White" && subject_partner_race == "Other (please specify)" || 
  //           subject_partner_race == "White" && subject_race == "Other (please specify)"){
  //             vis.WhiteAndOtherSum += vis.groupedDataArr[i][1][j][1];
  //         } else if(subject_race == "Black or African American" && subject_partner_race == "Asian or Pacific Islander" || 
  //           subject_partner_race == "Black or African American" && subject_race == "Asian or Pacific Islander"){
  //             vis.BlackAndAsianSum += vis.groupedDataArr[i][1][j][1];
  //         } else if(subject_race == "Black or African American" && subject_partner_race == "Other (please specify)" || 
  //           subject_partner_race == "Black or African American" && subject_race == "Other (please specify)"){
  //             vis.BlackAndOtherSum += vis.groupedDataArr[i][1][j][1];
  //         } else if(subject_race == "American Indian, Aleut, or Eskimo" && subject_partner_race == "Other (please specify)" || 
  //           subject_partner_race == "American Indian, Aleut, or Eskimo" && subject_race == "Other (please specify)"){
  //             vis.NativeAmericanAndOtherSum += vis.groupedDataArr[i][1][j][1];
  //         } else if(subject_race == "Asian or Pacific Islander" && subject_partner_race == "White" || 
  //           subject_partner_race == "Asian or Pacific Islander" && subject_race == "White"){
  //             vis.AsianAndWhiteSum += vis.groupedDataArr[i][1][j][1];
  //         }
  //     }
  //   }
  // }

    /**
     *  displays the tooltip information
     */
      toolTipInfo(event,d) {
        let vis = this;  

        // let couplesStillTogether = function (){
        //   let nums = vis.arrOfCountOfCouplesStillTogether[groupNum -1]/vis.arrOfRacialCategorySum[groupNum - 1];
        //   if (nums){
        //     return `<li>Percent of couples still together: ${nums.toFixed(2) * 100}%</li>`;
        //   } else {
        //     return ``;
        //   }
        // };

        d3.select('#tooltip')
        .style('display', 'block')
        .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
        .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
        .html(`
          <div><i>Details</i></div>
          <ul>
            <li>Age: ${d.ppage} </li>
            <li>Race: ${vis.subjectRace(d)} </li>
            <li>Partner's Race: ${vis.partnerRace(d)} </li>          
          </ul>
        `);
      }
  
  
  
  
  
  
  
  }
  
  
