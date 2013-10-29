var topology = data.topology;

var my_ip = data.links[0].localIP;

//get unique ips
var ips = d3.set(topology.map(function(d){
  return d.destinationIP;
})).values();

var lookup = {};

var ips = ips.map(function(d, i){
  lookup[d] = {ip: d};
  return lookup[d];
});

var links = [];
//var links = data.links.map(function(d, i){
//  lookup[d.remoteIP] = { ip: d.remoteIP };
//  ips.push(lookup[d.remoteIP]);
//  return {
//    "source": lookup[d.localIP],
//    "target": lookup[d.remoteIP]
//  };
//});
//
//data.neighbors.forEach(function(d, i) {
//  d.twoHopNeighbors.forEach(function(e, i) {
//    links.push({
//      "source": lookup[d.ipv4Address],
//      "target": lookup[e]
//    });
//  });
//  links.push({
//    "source": lookup[my_ip],
//    "target": lookup[d.ipv4Address]
//  });
//});

data.topology.forEach(function(d){
  links.push({
    "source": lookup[d.lastHopIP],
    "target": lookup[d.destinationIP],
    "etx": 1 / (d.linkQuality * d.neighborLinkQuality)
  });
});

var chart = document.getElementById("chart");

var width = chart.offsetWidth;
var height = chart.offsetHeight;

var force = d3.layout.force()
    .charge(-120)
    .linkDistance(30)
    .size([width, height]);

function redraw() {
  svg.attr("transform",
      "translate(" + d3.event.translate + ") "
      + "scale(" + d3.event.scale + ")");
}

var svg = d3.select("#chart").append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .attr("pointer-events", "all")
    .call(d3.behavior.zoom().on("zoom", redraw))
    .append('g');

svg.append("g").attr("class", "links");
svg.append("g").attr("class", "nodes");

force
  .nodes(ips)
  .links(links)
  .start();

//add linkes
var link = svg.select("g.links").selectAll("g.link")
  .data(links)
  .enter().append("line")
  .style("stroke", function(d){
    //color based on etx
    if(d.etx < 2) { return "green"; }
    else if(d.etx < 4) { return "yellow"; }
    else if(d.etx < 10) { return "orange"; }
    else { return "red"; }
  })
  .attr("class", "link");

//add nodes
var node = svg.select("g.nodes").selectAll("g.node")
    .data(ips)
  .enter().append("circle")
    .attr("class", "node")
    .attr("r", 5)
    .call(force.drag);

//add tooltip
node.append("title")
      .text(function(d) { return d.ip; });

//reposition
force.on("tick", function() {

  link.attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

  node.attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; });
});

node.append("title")
  .text(function(d) {
    return d.ip;
  })

window.onresize = resize;

function resize() {
  var chart = document.getElementById("chart");

  var w = chart.offsetWidth;
  var h = chart.offsetHeight;

  if (force) {
    force.size([w, h]).start();
  }

}
