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
      // code for sampling data gotten from: 
      // Shuffle array
      let numOfSampledData = 0.10 * this.data.length;
      const shuffled = this.data.sort(() => 0.5 - Math.random());

      // Get sub-array of first n elements after shuffled
      this.data = shuffled.slice(0, numOfSampledData);
  
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
      console.log(vis.noOfCirclesInARow);

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
      vis.width = (vis.dotRadius*2 + vis.dotPaddingLeft + vis.dotPaddingRight) * vis.noOfCirclesInARow;

     // name the race categories
     vis.raceCategories = ["White & Black", "Black & Native American", "Native American & Asian",
     "Asian & Other", "White & Other",  "Black & Asian", "Black & Other", "Native American & Other", "Asian & White"]

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

      vis.yAxis = d3.axisLeft(vis.yScale)
          .tickFormat( d => vis.uniqueGroups[d])
          .ticks(vis.uniqueGroups.length)
          .tickSize(-vis.width + vis.margin.left-(vis.dotRadius*2), 0, 0);

      //Create SVG element
      vis.svg = d3.select("#DotMatrixChart")
        .append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height",  vis.height + vis.margin.top + vis.margin.bottom)
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");
  
      vis.updateVis();
    }
  
    
    updateVis() {
      let vis = this;

      vis.subjectRace = d => d.w6_subject_race;
      vis.partnerRace = d => d.w6_q6b;

      vis.groupedDataArr = d3.groups(vis.data, d => d.CaseID);

      vis.xScale.domain([0,vis.noOfCirclesInARow]);
      vis.yScale.domain([0,1]);

      vis.renderVis();
    }
  
  
    renderVis() {
      let vis = this;

      vis.pointsPlotted = 0;
      vis.totalPointsToPlot = 0;
   

      // vis.populateLabelsUnderDots();
      // vis.updateCountOfCouplesStillTogether();
      // vis.updateCountOfRacialGroups();

       // save sums in array in order of categories in vis.raceCategories.
       vis.arrOfRacialCategorySum = [vis.whiteAndBlackSum, vis.blackAndNativeAmericanSum,  vis.nativeAmericanAndAsianSum,
        vis.AsianAndOtherSum,  vis.WhiteAndOtherSum, vis.BlackAndAsianSum, vis.BlackAndOtherSum, vis.NativeAmericanAndOtherSum,
        vis.AsianAndWhiteSum];

        let numPoints = -1;
        let yCord = vis.dotRadius;
        let xdivisor = Math.round(vis.width / 2 * vis.dotRadius);

        vis.circleArray = vis.svg.selectAll(".circleArray")
        .data(vis.groupedDataArr, d => {
          // console.log(d[1]);
          return d[1];})
        // .join('g')
        //   .selectAll(".circleArray")
        //     .data(d => d[1])
        //     // .append('g')
          .join("circle")
          .attr("class", "circleArray")
          .style("fill", d => {
            // console.log(d);
            return vis.getInterracialGroupColor(d[1]);})
          .attr("r", vis.dotRadius)
          .attr("cx", (d,index) => {
            // console.log((index * 2 * vis.dotRadius) % xdivisor);
            return ((index * 2 * vis.dotRadius) % xdivisor + vis.dotRadius);
          }) 
          .attr("cy",  (d,index) => {
            numPoints++;
            if(numPoints >= vis.noOfCirclesInARow) {
              // console.log(numPoints);
              // console.log(vis.noOfCirclesInARow);
              yCord += vis.dotRadius;
              numPoints = 0;
            }
            return yCord;
          })
          .on('mouseover', function (event,d) {
            console.log(d[1][0]);
            vis.toolTipInfo(event,d[1][0]);
          })
          .on('mouseleave', () => {
            d3.select('#tooltip').style('display', 'none');
          });

    }
  

/**
 * checks which interracial group a person is in
 */
    getInterracialGroupColor(d) {
      let vis = this;
      // let whiteAndBlackGroupFlag = false;
      // let blackAndNativeAmericanGroupFlag = false;
      // let nativeAmericanAndAsianGroupFlag = false;
      // let asianAndOtherGroupFlag = false;
      // let whiteAndOtherGroupFlag = false;
      // let blackAndAsianGroupFlag = false;
      // let blackAndOtherGroupFlag = false;
      // let nativeAmericanAndOtherGroupFlag = false;
      // let AsianAndWhiteGroupFlag = false;

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
            return "red";
          }
    }

    /**
     * For each circle, count how many couples in the circle are still together
     */
    updateCountOfCouplesStillTogether() {
      let vis = this;
      // let arrOfCouplesTogether = vis.data.filter(d => d.partnership_status == 1 || d.partnership_status == 2);
     
      let countWhiteAndBlackStillTogether = 0;
      let countBlackAndNativeAmericanStillTogether = 0;
      let countNativeAmericanAndAsianStillTogether = 0;
      let countAsianAndOtherStillTogether = 0;
      let countWhiteAndOtherStillTogether = 0;
      let countBlackAndAsianStillTogether = 0;
      let countBlackAndOtherStillTogether = 0;
      let countNativeAmericanAndOtherStillTogether = 0;
      let countAsianAndWhiteStillTogether = 0;

      for (let i = 0; i < vis.groupedDataArr.length; i++){
        let subject_race = vis.groupedDataArr[i][0];

        for (let j = 0; j < vis.groupedDataArr[i][1].length; j++){
          let subject_partner_race = vis.groupedDataArr[i][1][j][0];

          if (subject_race == "White" && subject_partner_race == "Black or African American" || 
              subject_partner_race == "White" && subject_race == "Black or African American"){
              countWhiteAndBlackStillTogether = vis.CountThoseTogetherInEachRaceCategory(subject_race, subject_partner_race);
          } else if(subject_race == "Black or African American" && subject_partner_race == "American Indian, Aleut, or Eskimo" || 
            subject_partner_race == "Black or African American" && subject_race == "American Indian, Aleut, or Eskimo"){
              countBlackAndNativeAmericanStillTogether = vis.CountThoseTogetherInEachRaceCategory(subject_race, subject_partner_race);
          } else if(subject_race == "American Indian, Aleut, or Eskimo" && subject_partner_race == "Asian or Pacific Islander" || 
            subject_partner_race == "American Indian, Aleut, or Eskimo" && subject_race == "Asian or Pacific Islander"){
              countNativeAmericanAndAsianStillTogether = vis.CountThoseTogetherInEachRaceCategory(subject_race, subject_partner_race);
          } else if(subject_race == "Asian or Pacific Islander" && subject_partner_race == "Other (please specify)" || 
            subject_partner_race == "Asian or Pacific Islander" && subject_race == "Other (please specify)"){
              countAsianAndOtherStillTogether = vis.CountThoseTogetherInEachRaceCategory(subject_race, subject_partner_race);
          } else if(subject_race == "White" && subject_partner_race == "Other (please specify)" || 
            subject_partner_race == "White" && subject_race == "Other (please specify)"){
              countWhiteAndOtherStillTogether = vis.CountThoseTogetherInEachRaceCategory(subject_race, subject_partner_race);
          } else if(subject_race == "Black or African American" && subject_partner_race == "Asian or Pacific Islander" || 
            subject_partner_race == "Black or African American" && subject_race == "Asian or Pacific Islander"){
              countBlackAndAsianStillTogether = vis.CountThoseTogetherInEachRaceCategory(subject_race, subject_partner_race);
          } else if(subject_race == "Black or African American" && subject_partner_race == "Other (please specify)" || 
            subject_partner_race == "Black or African American" && subject_race == "Other (please specify)"){
              countBlackAndOtherStillTogether = vis.CountThoseTogetherInEachRaceCategory(subject_race, subject_partner_race);
          } else if(subject_race == "American Indian, Aleut, or Eskimo" && subject_partner_race == "Other (please specify)" || 
            subject_partner_race == "American Indian, Aleut, or Eskimo" && subject_race == "Other (please specify)"){
              countNativeAmericanAndOtherStillTogether = vis.CountThoseTogetherInEachRaceCategory(subject_race, subject_partner_race);
          } else if(subject_race == "Asian or Pacific Islander" && subject_partner_race == "White" || 
            subject_partner_race == "Asian or Pacific Islander" && subject_race == "White"){
              countAsianAndWhiteStillTogether = vis.CountThoseTogetherInEachRaceCategory(subject_race, subject_partner_race);
          }
        }
      }

      vis.arrOfCountOfCouplesStillTogether = [countWhiteAndBlackStillTogether, countBlackAndNativeAmericanStillTogether, 
        countNativeAmericanAndAsianStillTogether, countAsianAndOtherStillTogether, countWhiteAndOtherStillTogether, countBlackAndAsianStillTogether,
        countBlackAndOtherStillTogether, countNativeAmericanAndOtherStillTogether, countAsianAndWhiteStillTogether];
    }

    /**
     * 
     * @param {*} subject_race race of the person interviewed
     * @param {*} subject_partner_race race of the interviewee's partner
     * @returns 
     */
    CountThoseTogetherInEachRaceCategory(subject_race, subject_partner_race) {
      let vis = this;
      let tempData = vis.data;
      let couplesOfSpecifiedRace = tempData.filter(d => (vis.subjectRace(d) == subject_race && vis.partnerRace(d) == subject_partner_race
        && (d => d.partnership_status == 1 || d.partnership_status == 2)));
        if(vis.maxCountOfThoseStillTogether < couplesOfSpecifiedRace.length) vis.maxCountOfThoseStillTogether = couplesOfSpecifiedRace.length;
      return couplesOfSpecifiedRace.length;
    }

    /**
     * Counts how many couples are in each of the 9 racial combos
     * and stores the count in the corresponding array
     */
    updateCountOfRacialGroups () {
      let vis = this;

      for (let i = 0; i < vis.groupedDataArr.length; i++){
        let subject_race = vis.groupedDataArr[i][0];

        for (let j = 0; j < vis.groupedDataArr[i][1].length; j++){
          let subject_partner_race = vis.groupedDataArr[i][1][j][0];
          if (subject_race == "White" && subject_partner_race == "Black or African American" || 
            subject_partner_race == "White" && subject_race == "Black or African American"){
              vis.whiteAndBlackSum += vis.groupedDataArr[i][1][j][1];
          } else if(subject_race == "Black or African American" && subject_partner_race == "American Indian, Aleut, or Eskimo" || 
          subject_partner_race == "Black or African American" && subject_race == "American Indian, Aleut, or Eskimo"){
            vis.blackAndNativeAmericanSum += vis.groupedDataArr[i][1][j][1];
          } else if(subject_race == "American Indian, Aleut, or Eskimo" && subject_partner_race == "Asian or Pacific Islander" || 
            subject_partner_race == "American Indian, Aleut, or Eskimo" && subject_race == "Asian or Pacific Islander"){
              vis.nativeAmericanAndAsianSum += vis.groupedDataArr[i][1][j][1];
          } else if(subject_race == "Asian or Pacific Islander" && subject_partner_race == "Other (please specify)" || 
            subject_partner_race == "Asian or Pacific Islander" && subject_race == "Other (please specify)"){
              vis.AsianAndOtherSum += vis.groupedDataArr[i][1][j][1];
          } else if(subject_race == "White" && subject_partner_race == "Other (please specify)" || 
            subject_partner_race == "White" && subject_race == "Other (please specify)"){
              vis.WhiteAndOtherSum += vis.groupedDataArr[i][1][j][1];
          } else if(subject_race == "Black or African American" && subject_partner_race == "Asian or Pacific Islander" || 
            subject_partner_race == "Black or African American" && subject_race == "Asian or Pacific Islander"){
              vis.BlackAndAsianSum += vis.groupedDataArr[i][1][j][1];
          } else if(subject_race == "Black or African American" && subject_partner_race == "Other (please specify)" || 
            subject_partner_race == "Black or African American" && subject_race == "Other (please specify)"){
              vis.BlackAndOtherSum += vis.groupedDataArr[i][1][j][1];
          } else if(subject_race == "American Indian, Aleut, or Eskimo" && subject_partner_race == "Other (please specify)" || 
            subject_partner_race == "American Indian, Aleut, or Eskimo" && subject_race == "Other (please specify)"){
              vis.NativeAmericanAndOtherSum += vis.groupedDataArr[i][1][j][1];
          } else if(subject_race == "Asian or Pacific Islander" && subject_partner_race == "White" || 
            subject_partner_race == "Asian or Pacific Islander" && subject_race == "White"){
              vis.AsianAndWhiteSum += vis.groupedDataArr[i][1][j][1];
          }
      }
    }
  }

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
  
  
