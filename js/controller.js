d3.csv(DATA_FILE, function(error, csv) {
  var data = d3.nest()
               .key(function(d) { return d.date; })
               .rollup(function(d) { return (d[0].crimes); })
               .map(csv);

  //Max, min, standard dev, etc.
  generateStatistics(csv.filter(function(d) {
    return d.date.indexOf("2016") >= 0;
  }));

  console.log(MAX, MIN, MEAN, STD_DEV);
  let choice = 'sequential';

  if(choice === 'sequential') {
    var domain = [MAX, MIN];
    var range  = d3.range(COLOR_COUNT)
                   .map( function(d) {
                     return "q" +d+ "-" +COLOR_COUNT;
                   });

    var color = d3.scale.quantize()
                        .domain(domain)
                        .range(range);


    rect.filter(function(d) { return d in data; })
        .attr("class", function(d) {
          return "day " + color(data[d]);
        });
  }
  else {
    let domain = [MIN, MAX];
    let range = d3.range(COLOR_COUNT)
                   .map( function(d) {
                     return "q" +d+ "-" +COLOR_COUNT;
                   });

    let color = function(d) {
       let classes = {"-3": "q0-5", "-2": "q1-5", "-1": "q2-5",
                     "1": "q2-5",  "2": "q3-5",  "3": "q4-5"};

       let sigma = function(n) {
         return MEAN+(n*STD_DEV);
       }

       let value = "";

       for(let n=-3; n<=3; n++) {
         if(n==0) continue;

         if(n<0) {
           if (sigma(n) <= d && d <= sigma(n+1))   value = classes[n];
         }

         if(n>0) {
           if (sigma(n-1) <= d && d <= sigma(n))   value = classes[n];
         }
       }

       return value;
   };
  }

  // Tooltip
  rect.on("mouseover", mouseover);
  rect.on("mouseout", mouseout);

  function mouseover(d) {
    var count_data = data[d] || 0;
    var tooltip_text = d + ": " + count_data;

    showTooltip(tooltip_text);
  }

  function mouseout (d) {
    hideTooltip();
  }

  /* Prints color ranges to console.
  for(d=0; d < COLOR_COUNT; d++){
      console.log(color.invertExtent("q"+d+"-"+COLOR_COUNT));
  }*/

});

d3.json(PARAMETERS, function(error, params) {
  getTypes(params);
});

function getTypes(parameters) {
  d3.csv(TYPE_FILE)
    .row(function(d) { return d.type })
    .get(function(error, data) {

      var content   = '<option value="ALL INCIDENTS">ALL INCIDENTS</option>'
      var template  = '<option value="{value}">{value}</option>'

      for(var d in data) {
          content += replaceAll('{value}', data[d], template);
      }

      d3.select('#type select')
        .html(content);

      d3.selectAll('select > option')
        .property('selected', function(){
          return (this.value === parameters.selection) ? true : false;
        });

      d3.selectAll('#type input')
        .property('checked', function(){
          return (this.value === parameters.sort) ? true : false;
        });
    });
}
