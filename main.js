var dateFormat = d3.timeFormat('%m/%d/%Y');

var toolTip = d3.tip()
.attr("class", "d3-tip")
.offset([-12, 0])
.html(function(d) {
    // Inject html, when creating your html I recommend editing the html within your index.html first
    return "<h5>"+d['event_name']+"</h5><table><thead><tr><td>date</td><td>num_attendees</td><td>event_name</td><td>incentive</td><td>budget</td></tr></thead>"
         + "<tbody><tr><td>"+(dateFormat(d['date']))+"</td><td>"+d['num_attendees']+"</td><td>"+d['event_name']+"</td><td>"+d['incentive']+"</td><td>"+d['budget']+"</td></tr></tbody></table>";
});

// set the dimensions and margins of the graph
var margin = {top: 50, right: 100, bottom: 100, left: 100},
    width = 860 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;


var svg = d3.select("svg")
  .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + (margin.left + 30) + "," + (margin.top + 30) + ")");

svg.call(toolTip);

var extentByAttribute = {};

var parseDate = d3.timeParse('%m/%d/%Y');
// To speed things up, we have already computed the domains for your scales
var dotsEnter;
var dot;
var xAxis;
var xScale;
var yScale;
var yAxis_group;
var dataFilter;

//Read the data
d3.csv("data.csv", function(data) {
    // Add X axis --> it is a date format
    data.forEach(function (d) {
      d.date = parseDate(d.date);
      console.log(d.date);
  })
 
    // List of groups (here I have one group per column)
    var allGroup = ["All", "Networking", "Social", "GBM"]

    // add the options to the button
    d3.select("#selectButton")
      .selectAll('myOptions')
     	.data(allGroup)
      .enter()
    	.append('option')
      .text(function (d) { return d; }) // text showed in the menu
      .attr("value", function (d) { return d; }) // corresponding value returned by the button

    xScale = d3.scaleTime()
    .domain(d3.extent(data, function(d) { return d.date; }))
    .range([0, width]);
    console.log(d3.extent(data, function(d) { return d.date; }));
    xAxis = d3.axisBottom(xScale)
    .tickFormat(d3.timeFormat("%b %Y"));
    var xAxis_group = svg.append("g")
     .attr("transform", "translate(0, "+ height+ ")")
      .call(xAxis);

    // Add Y axis
    yScale = d3.scaleLinear()
      .domain( d3.extent(data, function(d) { return +d["num_attendees"];}))
      .range([ height, 0 ]);
    yAxis_group = svg.append("g")
      .call(d3.axisLeft(yScale));
    var yAxisLabel = svg.append("g")
      .attr("transform", "translate(-40," + (height/2 + 40) + ")rotate(270)")
      .append("text")
      .text("Number of Attendees")
      .attr("fill", "black");

    // Initialize line with group a
    var line = svg
      .append('g')
      .append("path")
        .datum(data)
        .attr("d", d3.line()
          .x(function(d) { return xScale(+d['date']); })
          .y(function(d) { return yScale(+d['num_attendees']) })
        )
        .attr("stroke", "black")
        .style("stroke-width", 4)
        .style("fill", "none")

    dot = svg
      .selectAll('.dot')
      .data(data, function(d) {
        return d["event_name"] + "-" + d["num_attendees"] + d["category"] + d["date"];
      }) // Create a unique id for the car
      .enter()
      .append('circle')
        .attr("class", "dot")
        .attr("cx", function(d) { return xScale(+d.date) })
        .attr("cy", function(d) { return yScale(+d['num_attendees']); })
        .attr("r", 7)
        .style("fill", "#69b3a2")

      dot.on("mouseover", toolTip.show)
      .on('mouseout', toolTip.hide);

    function update(selectedGroup) {
      console.log(data);
      // Create new data with the selection?
      if (selectedGroup == "All") {
        dataFilter = data;
      } else {
        dataFilter = data.filter(function(d) {return d["category"] === selectedGroup});
      }

      console.log(dataFilter);
      
        xScale = d3.scaleTime()
        .domain(d3.extent(dataFilter, function(d) { return d.date; }))
        .range([0, width]);

        console.log(xScale);
        xAxis = d3.axisBottom(xScale)
          .tickFormat(d3.timeFormat("%b %Y"));

        xAxis_group.transition().duration(1000).call(xAxis);

        yScale = d3.scaleLinear()
        .domain( d3.extent(dataFilter, function(d) { return +d["num_attendees"];}))
        .range([ height, 0 ]);
      yAxis_group.transition().duration(1000)
        .call(d3.axisLeft(yScale));


      // Give these new data to update line
      line
          .datum(dataFilter)
          .transition()
          .duration(1000)
          .attr("d", d3.line()
            .x(function(d) { console.log("Revised line x is " + xScale(+d.date)); return xScale(+d.date) })
            .y(function(d) { return yScale(+d["num_attendees"]) })
          )
    
      
      let dots = svg.selectAll(".dot").data(dataFilter);
      
      console.log(dots);
      
      
      var dotsEnter = dots.enter()
      .append('circle')
      .attr('class', 'dot')
      .merge(dot)
      .attr("cx", function(d) {console.log(d["event_name"] + ": " + xScale(+d.date)); return xScale(+d.date) })
      .attr("cy", function(d) { return yScale(+d["num_attendees"]) })
      .attr("r", 7)
      .style("fill", "#69b3a2")
      .on('mouseover', toolTip.show)
        .on('mouseout', toolTip.hide);
      console.log(dots);
      
      dots.exit().remove();

      dots.transition()
      .duration(1000)
      .attr("cx", function(d) {console.log("TRANSITION " + d["event_name"] + ": " + xScale(+d.date)); return xScale(+d.date) })
      .attr("cy", function(d) { return yScale(+d["num_attendees"]) })
    }

        // When the button is changed, run the updateChart function
        d3.select("#selectButton").on("change", function(d) {
          // recover the option that has been chosen
          var selectedOption = d3.select(this).property("value")
          // run the updateChart function with this selected option
          update(selectedOption);
      })
})
// Remember code outside of the data callback function will run before the data loads

function dataPreprocessor(row) {
    return {
        'date': +row['date'],
        'num_attendees': +row['num_attendees'],
        'event_name': +row['event_name'],
        'incentive': +row['incentive'],
        'category': row["category"],
        'budget': row["budget"]
    };
}
