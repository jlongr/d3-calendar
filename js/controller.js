d3.csv(DATA_FILE, function(error, csv) {
  var data = d3.nest()
    .key(function(d) { return d.date; })
    .rollup(function(d) { return (d[0].crimes); })
    .map(csv);

  for(var d in data) {
    var datum = parseInt(data[d]);

    if(MIN > datum) MIN = datum;
    if(MAX < datum) MAX = datum;
  }

  if(MAX < COLOR_COUNT) {
    MAX = COLOR_COUNT;
  }

  var color = d3.scale.quantize()
      .domain([MAX, 0])
      .range(d3.range(COLOR_COUNT).map(function(d) { return "q" + d + "-11"; }));

  for(d=0; d < COLOR_COUNT; d++){
      var arr = color.invertExtent("q"+d+"-11")

      console.log("Range #" +d+ ": " +arr);
  }

    rect.filter(function(d) { return d in data; })
        .attr("class", function(d) { return "day " + color(data[d]); })
      .select("title")
        .text(function(d) { return d + ": " + data[d]; });

    //  Tooltip
    rect.on("mouseover", mouseover);
    rect.on("mouseout", mouseout);

    function mouseover(d) {
      tooltip.style("visibility", "visible");
      var count_data = (data[d] !== undefined) ? data[d] : 0; //percent(data[d]) : percent(0);
      var purchase_text = d + ": " + count_data;

      tooltip.transition()
                  .duration(200)
                  .style("opacity", .9);
      tooltip.html(purchase_text)
                  .style("left", (d3.event.pageX)+30 + "px")
                  .style("top", (d3.event.pageY) + "px");
    }

    function mouseout (d) {
      tooltip.transition()
              .duration(500)
              .style("opacity", 0);
      var $tooltip = $("#tooltip");
      $tooltip.empty();
    }
});
