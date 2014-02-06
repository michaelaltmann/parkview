document.addEventListener("DOMContentLoaded", function () {
    var tagline = document.querySelector("p.tagline");
    tagline.innerText = "From Cloud9 IDE!";
});

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
    t = dt;
    doSimulationStep();
}
function showStatus(s) {
    d3.select("#status").text(s);
}

function doSimulationStep() {
    console.log('Running sim to ' + t);
    showStatus('T = ' + t);
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
        .remove()

        ;
}