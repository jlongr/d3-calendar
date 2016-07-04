var START_YEAR = 2016;
var END_YEAR   = 2017;
var PARAMETERS = "static/data/parameters.json";
var TYPE_FILE  = "static/data/types.csv";
var DATA_FILE  = "static/data/data.csv";

var COLOR_COUNT = 11;
var MAX = COLOR_COUNT;

var width = 960,
    height = 750,
    cellSize = 25; // cell size

var no_months_in_a_row = Math.floor(width / (cellSize * 7 + 50));
var shift_up = cellSize * 3;

var day = d3.time.format("%w"), // day of the week
    day_of_month = d3.time.format("%e") // day of the month
    day_of_year = d3.time.format("%j")
    week = d3.time.format("%U"), // week number of the year
    month = d3.time.format("%m"), // month number
    year = d3.time.format("%Y"),
    format = d3.time.format("%Y-%m-%d");

var svg = d3.select("#chart").selectAll("svg")
    .data(d3.range(START_YEAR, END_YEAR))
  .enter().append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "RdYlGn")
  .append("g")

var rect = svg.selectAll(".day")
    .data(function(d) {
      return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1));
    })
  .enter().append("rect")
    .attr("class", "day")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", function(d) {
      var month_padding = 1.2 * cellSize*7 * ((month(d)-1) % (no_months_in_a_row));
      return day(d) * cellSize + month_padding;
    })
    .attr("y", function(d) {
      var week_diff = week(d) - week(new Date(year(d), month(d)-1, 1) );
      var row_level = Math.ceil(month(d) / (no_months_in_a_row));
      return (week_diff*cellSize) + row_level*cellSize*8 - cellSize/2 - shift_up;
    })
    .datum(format);

var month_titles = svg.selectAll(".month-title")  // Jan, Feb, Mar and the whatnot
      .data(function(d) {
        return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter().append("text")
      .text(monthTitle)
      .attr("x", function(d, i) {
        var month_padding = 1.2 * cellSize*7* ((month(d)-1) % (no_months_in_a_row));
        return month_padding;
      })
      .attr("y", function(d, i) {
        var week_diff = week(d) - week(new Date(year(d), month(d)-1, 1) );
        var row_level = Math.ceil(month(d) / (no_months_in_a_row));
        return (week_diff*cellSize) + row_level*cellSize*8 - cellSize - shift_up;
      })
      .attr("class", "month-title")
      .attr("d", monthTitle);

var year_titles = svg.selectAll(".year-title")
      .data(function(d) {
        return d3.time.years(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter().append("text")
      .text(yearTitle)
      .attr("x", function(d, i) { return width/2 - 100; })
      .attr("y", function(d, i) { return cellSize*5.5 - shift_up; })
      .attr("class", "year-title")
      .attr("d", yearTitle);

//  Tooltip Object
var tooltip = d3.select("body")
  .append("div").attr("id", "tooltip")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("visibility", "hidden")
  .text("a simple tooltip");

//Submits the incident-type selection.
$("#type").on("change", "select, input", function() {
  $("#type").submit();
});

function replaceAll(token, value, template){
  while(template.indexOf(token) >= 0){
    template = template.replace(token, value);
  }
  return template;
}

function showTooltip(tooltip_text){
  tooltip.style("visibility", "visible");

  tooltip.transition()
         .duration(200)
         .style("opacity", .9);

  tooltip.html(tooltip_text)
         .style("left", (d3.event.pageX)+30 + "px")
         .style("top", (d3.event.pageY) + "px");
}

function hideTooltip(){
  tooltip.transition()
         .duration(500)
         .style("opacity", 0);

  $("#tooltip").empty();
}

function dayTitle (t0) {
  return t0.toString().split(" ")[2];
}

function monthTitle (t0) {
  return t0.toLocaleString("en-us", { month: "long" });
}

function yearTitle (t0) {
  return t0.toString().split(" ")[3];
}
