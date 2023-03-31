class circlesChart {

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
      
      this.data = _data;
  
      this.initVis();
    }
    
    initVis() {
      let vis = this;
      vis.minCircSize = 5;
      vis.maxCircSize = 20;
  
      // Calculate inner chart size. Margin specifies the space around the actual chart.
      vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
      vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;


      // name the race categories
      vis.raceCategories = ["White & Black", "Black & Native American", "Native American & Asian",
       "Asian & Other", "White & Other",  "Black & Asian", "Black & Other", "Native American & Other", "Asian & White"]
  
      // intialize the scales
      vis.luminanceScale = d3.scaleLinear()
        .range([0.01,1]);

      vis.colorScale = d3.scaleOrdinal()
        .range(d3.schemeCategory10)
        .domain(vis.raceCategories);

      vis.sizeScale = d3.scaleSqrt()
        .range([vis.minCircSize, vis.maxCircSize]);
  
      vis.updateVis();
    }
  
    
    updateVis() {
      let vis = this;

      vis.subjectRace = d => d.w6_subject_race;
      vis.partnerRace = d => d.w6_q6b;

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

      vis.maxCount = 0;

      vis.groupedDataArr = d3.rollups(vis.data, v => v.length, vis.subjectRace, vis.partnerRace) //second is partner
      console.log(vis.groupedDataArr);
      let maxCount = 0;

      for (let i = 0; i < vis.groupedDataArr.length; i++){
        for (let j = 0; j < vis.groupedDataArr[i][1].length; j++){
          let currMax = vis.groupedDataArr[i][1][j][1];
          if ( currMax > maxCount){
            maxCount = currMax;
          }
        }
      }
      console.log(vis.groupedDataArr);
      console.log(maxCount);

      vis.sizeScale.domain([0,maxCount]);
      vis.luminanceScale.domain([0,vis.maxCountOfThoseStillTogether]); 


      vis.renderVis();
    }
  
  
    renderVis() {
      let vis = this;

      vis.pointsPlotted = 0;
      vis.totalPointsToPlot = 0;
      vis.numOfCategories = 9;

      vis.populateLabelsUnderDots();
      vis.updateCountOfCouplesStillTogether();
      vis.updateCountOfRacialGroups();

       // save sums in array in order of categories in vis.raceCategories.
       vis.arrOfRacialCategorySum = [vis.whiteAndBlackSum, vis.blackAndNativeAmericanSum,  vis.nativeAmericanAndAsianSum,
        vis.AsianAndOtherSum,  vis.WhiteAndOtherSum, vis.BlackAndAsianSum, vis.BlackAndOtherSum, vis.NativeAmericanAndOtherSum,
        vis.AsianAndWhiteSum];

      vis.renderCircles();
    }
  
    /**
     * Adjusts the attributes of the HTML dots
     */ 
    renderCircles(){    
      let vis = this;  
      for (let groupNum = 1; groupNum <= vis.numOfCategories; groupNum++){
        let id = "dot-" + groupNum;
        document.getElementById(id).style.height = 2 * vis.sizeScale(vis.arrOfRacialCategorySum[groupNum - 1]) + "px";
        // console.log(document.getElementById(id).style.height);
        document.getElementById(id).style.width = 2 * vis.sizeScale(vis.arrOfRacialCategorySum[groupNum - 1]) + "px";
        // console.log(document.getElementById(id).style.width);
        // console.log( vis.colorScale(vis.raceCategories[groupNum -1]));
        document.getElementById(id).style.background = vis.colorScale(vis.raceCategories[groupNum -1]);
        // console.log(document.getElementById(id).style.background);
        // console.log(vis.luminanceScale(groupNum -1));
        document.getElementById(id).style.opacity = vis.luminanceScale(vis.arrOfCountOfCouplesStillTogether[groupNum-1]);
                console.log(document.getElementById(id).style.opacity);
        document.getElementById(id).addEventListener("mouseover", function(event){
          vis.toolTipInfo(event, groupNum)});
          document.getElementById(id).addEventListener("mouseleave", function(event, d){
            d3.select('#tooltip').style('display', 'none');
          });
      }
    }

    /**
     * Adds labels under the circles
     */
    populateLabelsUnderDots(){
      let vis = this;
      for (let i = 0; i < vis.numOfCategories; i++) {
        // credit for how to get label by id: https://stackoverflow.com/a/2599634
        let id = "label-dot-" + (i + 1);
        // console.log(id);
        var element = document.getElementById(id);
        // console.log(element);
        element.innerHTML = vis.raceCategories[i];
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
      toolTipInfo(event,groupNum) {
        let vis = this;  

        let couplesStillTogether = function (){
          let nums = vis.arrOfCountOfCouplesStillTogether[groupNum -1]/vis.arrOfRacialCategorySum[groupNum - 1];
          if (nums){
            return `<li>Percent of couples still together: ${nums.toFixed(2) * 100}%</li>`;
          } else {
            return ``;
          }
        };

        d3.select('#tooltip')
        .style('display', 'block')
        .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
        .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
        .html(`
          <div><i>Details</i></div>
          <ul>
            <li>Number of couples: ${vis.arrOfRacialCategorySum[groupNum-1]} </li>
           ${couplesStillTogether()}
          </ul>
        `);
      }
  
  
  
  
  
  
  
  }
  
  
