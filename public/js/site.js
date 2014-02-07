
var sim; 

var svg = d3.select("#viz")
        .append("svg")
        .attr("width", 500)
        .attr("height", 100);   

var dt = 10;
var t = 0;
var maxt = 100;
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
        svg.selectAll("circle")
        .data(sim.businesses)
        .enter()
        .append("rect")
        .style("stroke", "black")
        .style("fill", function(d,i) { return d.color;} )
        .attr("width", 10)
        .attr("height", 20)
        .attr("x", function(d,i) { return 100 + 60*d.loc.lng;} )
        .attr("y", function(d,i) { return -50 + 60*d.loc.lat;} )
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
    svg.selectAll("circle")
        .data(sim.vehicles)
        .enter()
        .append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
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
}