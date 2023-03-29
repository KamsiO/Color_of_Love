class circlesChart {

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
      vis.minCircSize = 10;
      vis.maxCircSize = 100;
  
      // Calculate inner chart size. Margin specifies the space around the actual chart.
      vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
      vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;


      // name the race categories
      vis.raceCategories = ["White & Black", "Black & Native American", "Native American & Asian",
       "Asian & Other", "White & Other",  "Black & Asian", "Black & Other", "Native American & Other", "Asian & White"]
  
      // intialize the scales
      vis.luminanceScale = d3.scaleLinear()
        .range([0.3,1])
        .domain([0,8]); // this is the index of the group in vis.raceCategories


      vis.colorScale = d3.scaleOrdinal()
        .range(d3.schemeCategory10)
        .domain(vis.raceCategories);

      vis.sizeScale = d3.scaleSqrt()
        .range([vis.minCircSize, vis.maxCircSize]);

         
      // // append axis title
      // vis.chart.append('text')
      // .attr('class', 'axis-title')
      // .attr('y', vis.height - 15)
      // .attr('x', 0)
      // .attr('dy', '.71em')
      // .style('text-anchor', 'end')
      // .text('Close up')
      // .style('font-weight', 'bold');
  
      // // append view title
      // vis.chart.append('text')
      // .attr('class', 'axis-title')
      // .attr('y', -15)
      // .attr('x', 250)
      // .attr('dy', '.71em')
      // .style('text-anchor', 'end')
      // .text('Show the people from '  + currcirclesChartSubCategory 
      // + 'couples that ranked the quality of their relationship as ' + currcirclesChartMainCategory)
      // .style('font-weight', 'bold');
  
      vis.updateVis();
    }
  
    
    updateVis() {
      let vis = this;
      vis.subjectRace = d => d.w6_subject_race;
      vis.partnerRace = d => d.w6_q6b;

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

      vis.countOfCouplesStillTogether = 0;
    
      // vis.yScale.domain(d3.extent(vis.data.map(d => d.CaseID)));
  
      vis.interracialColour = 'blue';
      vis.nonInterracialColour = 'red';
      // vis.refusedToAnswerRaceColor = 'yellow';
  
      vis.maxCount = 0;

      vis.groupedDataArr = d3.rollups(vis.data, v => v.length, vis.subjectRace, vis.partnerRace) //second is partner
      console.log(vis.groupedDataArr);
      // how to get the max of a 2-d array: https://stackoverflow.com/a/69213129
      let maxCount = 0;

      for (let i = 0; i < vis.groupedDataArr.length; i++){
        for (let j = 0; j < vis.groupedDataArr[i][1].length; j++){
          let currMax = vis.groupedDataArr[i][1][j][1];
          if ( currMax > maxCount){
            maxCount = currMax;
          }
        }
      }
      console.log(maxCount);

      vis.sizeScale.domain([0,maxCount]);

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

        console.log(vis.arrOfRacialCategorySum);

      vis.renderCircles();

      vis.getMax = (arr) => {
        let max = 0; 

        for (let j = 0; j < arrlength; j++){
          // console.log(vis.groupedDataArr[i][1][j][1]);
          let currMax = vis.groupedDataArr[i][1][j][1];
          if ( currMax > maxCount){
            maxCount = currMax;
          }
        }
        return max;  
      }
    }
  
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
        document.getElementById(id).style.opacity = vis.luminanceScale(groupNum -1);
        document.getElementById(id).addEventListener("hover", function(event){
          vis.toolTipInfo(event, groupNum)});
          document.getElementById(id).addEventListener("hover", function(event, d){
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

    updateCountOfCouplesStillTogether() {
      let vis = this;
      let arrOfCouplesTogether = vis.data.filter(d => d.partnership_status == 1 || d.partnership_status == 2);
      vis.countOfCouplesStillTogether = arrOfCouplesTogether.length;
    }

    /**
     * Counts how many couples are in each of the 9 racial combos
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
        d3.select('#tooltip')
        .style('display', 'block')
        .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
        .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
        .html(`
          <div><i>Details</i></div>
          <ul>
            <li>Number of couples: ${vis.arrOfRacialCategorySum[groupNum-1]} </li>
            <li>Percent of couples still together: ${vis.countOfCouplesStillTogether/vis.arrOfRacialCategorySum[groupNum - 1]}</li>
          </ul>
        `);
      }
      // w6_subject_race
  
  
  
  
  
  
  
  }
  
  
