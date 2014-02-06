
var sim; 

var svg = d3.select("#viz")
        .append("svg")
        .attr("width", 500)
        .attr("height", 100);   

var dt = 10;
var t = 0;
var maxt = 100;
var timeScale = 1000;
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
        .style("fill", "grey")
        .attr("width", 10)
        .attr("height", 20)
        .attr("x", function(d,i) { return 100 + 60*d.loc.lng;} )
        .attr("y", 0)

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
    } else {
            showStatus('Alll done');
    }
    
}

function display(t) {        
    svg.selectAll("circle")
        .data(sim.vehicles)
        .enter()
        .append("circle")
        .transition()
        .each('start',function(d,i) {showStatus(d.start);})
        .delay(function(d,i) { return timeScale * (d.start - sim.simulationManager.now + dt); })
        .duration(30)
        .style("stroke", "gray")
        .style("fill", "white")
        .attr("r", 10)
        .attr("cx", function(d,i) { return 100 + 60*d.lat;} )
        .attr("cy", 50)
        .transition()
        .duration(30)
        .attr("r", 5)
        .transition()
        .duration(function (d,i) { return  -60+ timeScale*(d.end-d.start); })
        .each('end',function(d,i) {showStatus(d.end);})
        .remove()

        ;
}