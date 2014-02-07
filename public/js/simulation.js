function Simulation () {
    this.spotManager = new SpotManager(this);
    this.simulationManager = new SimulationManager(this);
    this.businesses = [];
    this.vehicles = [];

this.log = function log(msg) {
    console.log(this.simulationManager.now + " " + msg);
}


Simulation.prototype.reset = function() {
    this.simulationManager.reset();
    this.spotManager.reset();
    for (var i=0; i< this.businesses.length; i++) {
        var business = this.businesses[i];
        this.simulationManager.addEvent( business.nextEvent());
    }
};
function Spot(lng, lat, capacity) {
    this.lng = lng;
    this.lat = lat;
    this.capacity = capacity;
}
Spot.prototype.toString = function () {
    return "["+this.lat + "," + this.lng + "]";
};

function Business(simulation, name, loc, color, arrivalFreq, walkingTolerance, meanDuration) {
    this.simulation = simulation;
    this.name = name;
    this.loc = loc;
    this.color = color;
    this.arrivalFreq = arrivalFreq;
    this.walkingTolerance = walkingTolerance;
    this.meanDuration = meanDuration;
}

Business.prototype.nextEvent = function () {
    var t = this.simulation.simulationManager.now +  -this.arrivalFreq * Math.log( Math.random());
    return new ArrivalEvent(this.simulation, t, this, this.duration(), this.walkingTolerance);
};
Business.prototype.toString = function () {
    return this.name + " " + "["+this.loc.lat + "," + this.loc.lng + "]";
};

Business.prototype.duration = function () {
    return this.meanDuration;
};

function ArrivalEvent(simulation, time,  business, duration, walkingTolerance) {
    this.simulation = simulation;
    this.time = time;
    this.business = business;
    this.duration = duration;
    this.walkingTolerance = walkingTolerance;
}
ArrivalEvent.prototype.execute = function () {
    var spot = this.simulation.spotManager.findSpot(this.business.loc, this.walkingTolerance);
    if (spot) {
        this.simulation.log("Parking in " + JSON.stringify(spot) + " for " + this.business.name);
        this.simulation.spotManager.acquire(spot);
        var now = this.simulation.simulationManager.now;
        var departureTime = now + this.duration;
        var v = {lat: spot.lat, lng: spot.lng, business: this.business, start: now, end: departureTime };
        this.simulation.vehicles.push(v);
        this.simulation.simulationManager.addEvent(new DepartureEvent(this.simulation, now, departureTime, spot));
    } else {
        this.simulation.log("*** Nowhere to park " + this);
    }
    this.simulation.simulationManager.addEvent(this.business.nextEvent());

};
ArrivalEvent.prototype.toString = function () {
    var loc = this.business.loc;
    return JSON.stringify({type: "Arrival", time : this.time, duration: this.duration, loc: "["+loc.lat + "," + loc.lng + "]"});
};

function DepartureEvent(simulation, start, time, spot ) {
    this.simulation = simulation;
    this.start = start;
    this.time = time;
    this.spot = spot;
}
DepartureEvent.prototype.execute = function () {
    this.simulation.log("Leaving " + JSON.stringify(this.spot));
    this.spot.occupancy += (this.time - this.start);
    this.simulation.spotManager.release(this.spot);
};
DepartureEvent.prototype.toString = function () {
    return JSON.stringify({type: "Departure", time : this.time, spot: this.spot});
};

function EventQueue() {
    this.events = [];
}

EventQueue.prototype.peek = function () {
    return this.events[this.events.length-1];
};
EventQueue.prototype.pop = function () {
    return this.events.pop();
};
EventQueue.prototype.add = function (event) {
    this.events.unshift(event);
    this.events.sort(this.comparator);
};

EventQueue.prototype.size = function () {
    return this.events.length;
};
EventQueue.prototype.comparator = function (x,y) {
    var d =  y.time - x.time;
    return d;
};

function SpotManager (simulation) {
    this.simulation = simulation;
    this.spots = [];
}
SpotManager.prototype.reset = function(spot) {
    for (var index = 0; index < this.spots.length; ++index) {
        var spot = this.spots[index];
        spot.occupancy = 0.0;
    }
}
SpotManager.prototype.add = function(spot) {
    this.spots.push(spot);
};
SpotManager.prototype.findSpot = function(loc, walkingTolerance) {
 //  this.simulation.log("Finding a spot near " + JSON.stringify(loc));
    var bestSpot = null;
    var bestDesirability = null;
    
    for (var index = 0; index < this.spots.length; ++index) {
        var spot = this.spots[index];
        var capacity = spot.capacity;
        if (capacity<=0) continue;
//      this.log(" checking " + JSON.stringify(spot));
        var desire = this.desirability(loc, spot, walkingTolerance);
        if ((!bestDesirability) ||  bestDesirability < desire) {
            bestDesirability = desire;
            bestSpot = spot;
        }
    }
    return bestSpot;
};
SpotManager.prototype.acquire = function(spot) {
    spot.capacity--;
};
SpotManager.prototype.release = function(spot) {
    spot.capacity++;
};
SpotManager.prototype.desirability = function(location, spot, walkingTolerance) {
    var dist =  Math.abs(spot.lng - location.lng) + Math.abs(spot.lat-location.lat);
    if (dist > walkingTolerance) return 0;
    return walkingTolerance - dist;
};

function SimulationManager (simulation) {
    this.simulation = simulation;
}
SimulationManager.prototype.reset = function(event) {
    this.eventQueue = new EventQueue();
    this.maxEvents = null;
    this.now = 0;
};

SimulationManager.prototype.runUntil = function(endTime) {
    var events = 0;
    while (this.eventQueue.size()>0) {
        var e = this.eventQueue.peek();
        if (e.time > endTime) return;
        e = this.eventQueue.pop();
        this.now = e.time;
        events ++;
        if (this.maxEvents && (events > this.maxEvents)) return;
//      this.log("Executing " + e);
        e.execute();
    }
};
SimulationManager.prototype.addEvent = function(event) {
 //   log("Adding " + event);
    this.eventQueue.add(event);
};

this.initialize = function () {
    this.spotManager.add( new Spot(0,0,1));
    this.spotManager.add( new Spot(1,0,1));
    this.spotManager.add( new Spot(2,0,1));
    this.spotManager.add( new Spot(3,0,1));

    var arrivalFreq = 4.0; // about every 4 time units
    var meanDuration = 2.0; // stays about 2 time units
    var walkingTolerance = 2.5;
    this.businesses.push(new Business(this,"Bakery", {lng: 0, lat:1}, 'brown' , arrivalFreq, walkingTolerance, meanDuration));
    this.businesses.push(new Business(this,"Flowers", {lng: 3, lat:1}, 'green', arrivalFreq, walkingTolerance, meanDuration));

    this.reset();
}



this.runUntil = function (time) {
    this.simulationManager.runUntil(time);
}
}

