let varForFilteringcirclesChart = "";
let currcirclesChartMainCategory = ""; // the relationship ranking
let currcirclesChartSubCategory = ""; // whether the person is part of an interracial couple
let relationshipRanking = d => d.Q34;
let whetherInterracialOrSameRace = d => d.interracial_5cat;
let subjectRace = d => d.w6_subject_race;
let partnerRace = d => d.w6_q6b;
let sexFrequency = d => d.w6_sex_frequency;
let religiousity = d => d.ppp20072;

const MEETING_METHODS = {
  0: "Education",
  1: "Professional Setting",
  2: "Social Setting",
  3: "Internet Website",
  4: "Online Social Networking",
  5: "Abroad",
  6: "Mutual Connection",
};

const MEETING_METHODS_CHECKS_MAPPING = {
  Education: checkEducationMethod,
  "Professional Setting": checkProfessionalSettingMethod,
  "Social Setting": checkSocialSettingMethod,
  "Internet Website": checkInternetSiteMethod,
  "Online Social Networking": checkOnlineSocialNetworkingMethod,
  Abroad: checkAbroadMethod,
  "Mutual Connection:": checkMutualConnectionMethod,
};

/**
 * Load data from CSV file asynchronously and render charts
 */
let treeMap, barChart, dotmatrix, heatMap, data;
d3.csv('data/dating.csv').then(_data => {
    data = _data;
    
    // Global data processing
    data.forEach(d => {
        if (subjectRace(d) === partnerRace(d)) {
            d.interracial_5cat = "no";
        } else {
            d.interracial_5cat = "yes";
        }
    });

    // initialize visualizations
    dotmatrix = new DotMatrix({
        parentElement: '#dot-matrix',
    }, data);

    treeMap = new TreeMap({
        parentElement: "#tree-map",
    }, 
    data, 
    {
        checkEducationMethod,
        checkProfessionalSettingMethod,
        checkSocialSettingMethod,
        checkInternetSiteMethod,
        checkOnlineSocialNetworkingMethod,
        checkAbroadMethod,
        checkMutualConnectionMethod,
      });

    barChart = new BarChart({
        parentElement: '#bar-chart-plot',
    }, data);

    heatMap = new HeatMap({
        parentElement: '#heat-map',
    }, data);
});

// https://stackoverflow.com/questions/24193593/d3-how-to-change-dataset-based-on-drop-down-box-selection
// event listeners for the dropdown

// the flag ensures that we don't re-filter the data if we don't need to
let currSelection;
d3.selectAll("#age-group-filter-dropdown").on("change", function (e) {
    // Filter data accordingly and update vis

    if (currSelection !== e.target.value) {
        currSelection = e.target.value;
        if (currSelection == "all") {
            treeMap.data = data;
            heatMap.data = data;
            dotmatrix.data = data;
            barChart.data = data;
        } else {
            let ageData = data.filter(d => d.ppagecat === currSelection);
            treeMap.data = ageData;
            heatMap.data = ageData;
            dotmatrix.data = ageData;
            barChart.data = ageData;
        }
        treeMap.updateVis();
        heatMap.updateVis();
        dotmatrix.updateVis();
        barChart.updateVis();
    }
});


/**
 * FUNCTIONS CALLED WHEN A DOT IS CLICKED
 */

function TreeMapfilterDotMatrixChartData(dotClicked) {
  let meetingMethod = "";
  for (let i = 0; i < 7; i++) {
    if (MEETING_METHODS_CHECKS_MAPPING[MEETING_METHODS[i]](dotClicked)) {
      meetingMethod = MEETING_METHODS[i];
      console.log( MEETING_METHODS[i])
    }
  }
  if (meetingMethod !== "") {
    let filteredData = treeMap.data.filter((d) =>
      MEETING_METHODS_CHECKS_MAPPING[meetingMethod](d)
    );
    console.log(filteredData);
    treeMap.highlightedData = filteredData;
    treeMap.updateVis();
  }
}

/**
 * highlights a bar that corresponds to the dot (if available) when a button is clicked
 * @param dotClicked is the dot that was clicked.
 */
function filterBarChartData(dotClicked) {
    barChart.highlightedData = [relationshipRanking(dotClicked), whetherInterracialOrSameRace(dotClicked)];
    barChart.updateVis();
}


/**
 * highlights a cell that corresponds to the dot's sex and religion habits (if available) when dot is clicked
 * @param dotClicked is the dot that was clicked.
 */
function selectHeatMapCell(dotClicked) {
    heatMap.selectedCategories = [dotClicked.ppp20072, dotClicked.w6_sex_frequency];
    heatMap.renderVis();
}


/**
 * FUNCTIONS TO SELECT THE CORRESPONDING DOTS WHEN ANOTHER VIEW IS CLICKED
 * 
 */

 /* filter the data rendered in the dot matrix according to:
 * @param mainCategory the relationship ranking
 * @param subCategory bar clidked (interracial or same race)
 */
function filterDotMatrixChartData() {
  let filteredData = dotmatrix.data.filter(
    (d) =>
      relationshipRanking(d) == currcirclesChartMainCategory &&
      whetherInterracialOrSameRace(d) == currcirclesChartSubCategory
  );
  console.log(filteredData);
  dotmatrix.highlightedData = filteredData;
  dotmatrix.updateVis();
}

/**
 * filter the data rendered in the dot matrix chart according to:
 * @param sexFreq the y-value of the cell in the heat map
 * @param attendance the x-value of the cell in the heat map
 */
function heatMapfilterDotMatrixChartData(sexFreq, attendance) {
    console.log(sexFreq);
    console.log(attendance);
    dotmatrix.highlightedData = dotmatrix.data.filter(d => (sexFrequency(d) == sexFreq) && (religiousity(d) == attendance));
    console.log(dotmatrix.highlightedData);
    dotmatrix.updateVis();
}

/**
 * Use treemap as filter and update dotMatrix accordingly
 */
function filterWithMeetingData(meetingCategory) {
    dotmatrix.highlightedData = dotmatrix.data.filter((d) => {
        // console.log(meetingCategory);
        return MEETING_METHODS_CHECKS_MAPPING[meetingCategory](d) }
    );
    dotmatrix.updateVis();
}

/**
 * filter the data rendered in the dot matrix chart according to:
 * mainCategory the relationship ranking
 * subCategory bar clidked (interracial or same race)
 */
function barChartFilterDotMatrixChartData() {
    dotmatrix.highlightedData = dotmatrix.data.filter(d => (relationshipRanking(d) == currcirclesChartMainCategory) && (whetherInterracialOrSameRace(d) == currcirclesChartSubCategory));
    console.log(dotmatrix.highlightedData);
    dotmatrix.updateVis();
}





