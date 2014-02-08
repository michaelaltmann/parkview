
var sim; 

var svg = d3.select("#viz")
        .append("svg")
        .attr("width", 900)
        .attr("height", 100);
    svg
    .append('defs')
    .append('clipPath')
    .attr('id', 'clip')
    .append('circle')
    .attr('r',10)
    .attr('cx',10)
    .attr('cy',10)
;   

var dt = 10;
var t = 0;
var maxt = 500;
var timeScale = 100;
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
        .attr("x", function(d,i) { return 100 + 60*d.loc.lng -5;} )
        .attr("y", function(d,i) { return -50 + 60*d.loc.lat;} )
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
        .attr("cx", function(d,i) { return 100 + 60*d.lng;} )
        .attr("cy", function(d,i) { return  50 + 60*d.lat;} )
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
        .attr("cx", function(d,i) { return 100 + 60*d.lng;} )
        .attr("cy", function(d,i) { return 200 + 60*d.lat;} )
        .transition()
        .each('start',function(d,i) {showStatus(d.start);})
        .delay(function(d,i) { return timeScale * (d.start - sim.simulationManager.now + dt); })
        .duration(30)
        .style("stroke", "gray")
        .style("opacity", "0.5")
        .style("fill", function(d,i) { return d.business.color;} )
        .attr("r", 10)
        .attr("cx", function(d,i) { return 100 + 60*d.lng;} )
        .attr("cy", function(d,i) { return  50 + 60*d.lat;} )
        .transition()
        .duration(30)
        .attr("r", 5)
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
        .style("opacity", "0.5")
        .style("fill", 'gray' )
        .attr("width", 20)
        .attr("height", function(d,i) { return occupancyScale * 20*d.occupancy/sim.simulationManager.now;} )
        .attr("clip-path", "url(#clip)")
        .attr("y", function(d,i) { return 20 - occupancyScale* 20*d.occupancy/sim.simulationManager.now;} )
        .attr('transform',function(d) { 
            var dx = 100 + 60*d.lng -10 ;
            var dy = 40 + 60*d.lat ;
            return "translate("+dx+"," + dy + ")";})
;
}
var occupancyScale = 2;