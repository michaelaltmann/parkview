
var width = Math.max(960),
    height = Math.max(500);
var latitude = 44.9251669;
var longitude = -93.31678;

var projection = d3.geo.mercator();
    projection.center([longitude, latitude])
    .scale(10000000);
   

var path = d3.geo.path()
    .projection(projection);

var tile = d3.geo.tile()
    .scale(projection.scale() * 2 * Math.PI)
    .translate(projection([0, 0]))
    .zoomDelta((window.devicePixelRatio || 1) - .5);

var svg = d3.select("#viz").append("svg")
    .attr("width", width)
    .attr("height", height);



function zoomed() {
  var tiles = tile();
  
svg.append("g")
    .selectAll("image")
      .data(tiles)
    .enter().append("image")
      .attr("xlink:href", function(d) { 
          var i = (Math.random() * 3 )| 0;
          var server = ["a", "b", "c"][i];
          return "http://" + server + ".tile.openstreetmap.org/" 
      + d[2] + "/" + d[0] + "/" + d[1] + ".png"; })
      .attr("width", Math.round(tiles.scale))
      .attr("height", Math.round(tiles.scale))
      .attr("x", function(d) { return Math.round((d[0] + tiles.translate[0]) * tiles.scale); })
      .attr("y", function(d) { return Math.round((d[1] + tiles.translate[1]) * tiles.scale); });

}
zoomed();

svg
    .append('defs')
    .append('clipPath')
    .attr('id', 'clip')
    .append('circle')
    .attr('r',10)
    .attr('cx',10)
    .attr('cy',10)
;   

var sim; 
var dt = 10;
var t = 0;
var maxt = 1000;
var timeScale = 200;

if(sim) sim.stop(); 
sim=new Simulation(); 
buildCity(); 
showBackground();

function doSimulation() {
    showBackground();
    t = dt;
    doSimulationStep();
}
function showStatus(s) {
    d3.select("#status").text(s);
}

function showBackground() {
    
    svg.selectAll(".business").remove();
        svg.selectAll(".business")
        .data(sim.businesses)
        .enter()
        .append("rect")
        .attr("class", "business")
        .style("stroke", "black")
        .style("fill", function(d,i) { return d.color;} )
        .attr("width", 10)
        .attr("height", 20)
        .attr("x", function(d,i) { return projection(d.loc)[0]-5;} )
        .attr("y", function(d,i) { return projection(d.loc)[1]-10;} )
        ;
    
    svg.selectAll(".spot").remove();
    svg.selectAll(".spot")
        .data(sim.spotManager.spots)
        .enter()
        .append("circle")
        .attr("class", "spot")
        .style("stroke", "black")
        .style("opacity", "1.0")
        .style("fill", "none" )
        .attr("r", 12)
        .attr("cx", function(d,i) { return projection(d.loc)[0];} )
        .attr("cy", function(d,i) { return  projection(d.loc)[1];} )
;


}
function doSimulationStep() {
    console.log('Running sim to ' + t);
//    showStatus('T = ' + t);
    sim.vehicles = [];
    sim.runUntil(t);
    display();
    t +=  dt;
    if (t < maxt) {
        window.setTimeout(doSimulationStep, dt * timeScale);
    }    
}

function display(t) {        
    svg.selectAll(".vehicle")
        .data(sim.vehicles)
        .enter()
        .append("circle")
        .attr("class", "vehicle")
        .attr("cx", function(d,i) { return projection(d.loc)[0];} )
        .attr("cy", function(d,i) { return projection(d.loc)[1];} )
        .transition()
        .each('start',function(d,i) {showStatus(d.start);})
        .delay(function(d,i) { return timeScale * (d.start - sim.simulationManager.now + dt); })
        .duration(30)
        .style("stroke", "gray")
        .style("opacity", "0.7")
        .style("fill", function(d,i) { return d.business.color;} )
        .attr("r", 10)
        .attr("cx", function(d,i) { return projection(d.loc)[0];} )
        .attr("cy", function(d,i) { return  projection(d.loc)[1];} )
        .transition()
        .duration(30)
        .attr("r", 7)
        .transition()
        .duration(function (d,i) { return  -60+ timeScale*(d.end-d.start); })
        .each('end',function(d,i) {showStatus(d.end);})
        .remove()
        ;
    
    svg.selectAll(".spotUsage").remove();
    svg.selectAll(".spotUsage")
        .data(sim.spotManager.spots)
        .enter()
        .append("rect")
        .attr("class", "spotUsage")
        .style("stroke-width", "0")
        .style("opacity", "0.9")
        .style("fill", 'purple' )
        .attr("width", 20)
        .attr("height", function(d,i) { return occupancyScale * 20*d.occupancy/sim.simulationManager.now;} )
        .attr("clip-path", "url(#clip)")
        .attr("y", function(d,i) { return 20 - occupancyScale* 20*d.occupancy/sim.simulationManager.now;} )
        .attr('transform',function(d) { 
            var dx = projection(d.loc)[0]-10;
            var dy = projection(d.loc)[1]-10;
            return "translate("+dx+"," + dy + ")";})
;
}
var occupancyScale = 1;

function buildCity () {
    var x0 = -93.31587016582489;
    var dx =   (-93.3146-x0)/10;
    var y0 = 44.9248;
    var dy =  (44.924657382371365 - y0)/10;
    for (var i=0; i < 10; i++) {
        sim.addSpot(x0 + i*dx,y0 + i*dy,1);
    }
    x0 += -0.00004;
    y0 +=  -0.0001;
    for (var i=0; i < 10; i++) {
        sim.addSpot(x0 + i*dx,y0 + i*dy,1);
    }

    var arrivalFreq = 4.0; // about every 4 time units
    var meanDuration = 5.0; // stays about 5 time units
    var walkingTolerance = 3.5;
    sim.addBusiness("Bakery", [x0 + 5*dx,  y0-10*dy], 'yellow' , arrivalFreq, walkingTolerance, meanDuration);
    sim.addBusiness("Flowers", [x0+ 8*dx,  y0+15*dy], 'green', arrivalFreq, walkingTolerance, meanDuration);
    sim.addBusiness("Hardware", [x0+3*dx, y0+9*dy], 'red' , arrivalFreq, walkingTolerance, meanDuration);

    sim.reset();
}

