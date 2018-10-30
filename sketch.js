var mapData;
var city_limit;
var busy_limit;
var paddingX = 20;
var paddingY = 20;
var from;
var to;

function preload() {
  font = loadFont('./assets/DINPro-Black.otf')
  mapData = loadJSON('./assets/tpl_percorsi.geojson');
  timeData = loadJSON('./assets/tpl_orari.geojson');
  metroMapData = loadJSON('./assets/tpl_metropercorsi.geojson');
  metroTimeData = loadJSON('./assets/tpl_metroorari.geojson');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  city_limit = getBoundingBox(mapData);
  busy_limit = getHowBusy(timeData);
  metroBusy_limit = getHowBusy(metroTimeData);

  var margin = {x: height/10, y: height/10}
  var fontSize = margin.x/1.93;

  underground = new setButton("Underground", fontSize, fontSize*2,  fontSize,   fontSize*4.2, true);
  tram        = new setButton("Tram",        fontSize, fontSize*3,  fontSize,   fontSize*2.5, true);
  bus         = new setButton("Bus",         fontSize, fontSize*4,  fontSize,   fontSize*1.7, true);

  week        = new setButton("Weekday",     fontSize, fontSize*6,  fontSize,   fontSize*4.2, true );
  sat         = new setButton("Saturday",    fontSize, fontSize*7,  fontSize,   fontSize*4.2, false);
  sun         = new setButton("Sunday",      fontSize, fontSize*8,  fontSize,   fontSize*3.4, false);
}


function setButton(_name, _x, _y, _size, _sizeX, _defaultStatus) {
  var alpha;

  this.status = _defaultStatus;
  this.x = _x;
  this.y = _y;
  this.sizeX = _sizeX;

  this.update = function update() {
    if ((mouseX > _x) && (mouseY < _y) && (mouseX < _x + _sizeX) && (mouseY > _y - 50)) {
      if (this.status == false) {
        this.status = true;
      } else {
        this.status = false;
      };
    };
  };

  this.show = function show() {
    fill(100)
    noStroke();
    textAlign(LEFT);
    textFont(font, _size);

    //  fill(255, 200, 200)
    //  rect(_x, _y-50, _sizeX, _size)
    blendMode(BLEND)
    if (this.status == true) {
      fill(255)
    } else {
      fill(255, 50)
    }

    text(_name, _x, _y - 5);
  };
}



function getBoundingBox(mapData) {
  var bounds = {};
  var coords, latitude, longitude;
  for (var i = 0; i < mapData.features.length; i++) {
    for (var j = 0; j < mapData.features[i].geometry.coordinates.length; j++) {
      coords = mapData.features[i].geometry.coordinates[j];
      for (var k = 0; k < coords.length; k++) {
        longitude = coords[0];
        latitude = coords[1];
        bounds.xMin = bounds.xMin < longitude ? bounds.xMin : longitude;
        bounds.xMax = bounds.xMax > longitude ? bounds.xMax : longitude;
        bounds.yMin = bounds.yMin < latitude ? bounds.yMin : latitude;
        bounds.yMax = bounds.yMax > latitude ? bounds.yMax : latitude;
      }
    }
  }
  return bounds;
};

function getHowBusy(timeData) {
  var bounds = {};
  for (var i = 0; i < timeData.features.length; i++) {
    bounds.min = bounds.min < timeData.features[i].properties.corse_gior ? bounds.min : timeData.features[i].properties.corse_gior;
    bounds.max = bounds.max > timeData.features[i].properties.corse_gior ? bounds.max : timeData.features[i].properties.corse_gior;
  };
  return bounds;
};

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
};

function mouseClicked() {
  tram.update()
  bus.update()
  underground.update()

  week.update()
  sat.update()
  sun.update()
}

function draw() {
  paddingX = (windowWidth - (windowHeight / 1.1644)) / 2;
  background(20);
  blendMode(BLEND);
  strokeWeight(1);
  noFill();
  from  = color(190, 255, 150, 30);
  to    = color(255, 255, 255, 100);

  for (var i = 0; i < mapData.features.length; i++) {

    for (var k = 0; k < timeData.features.length; k++) {

      if (timeData.features[k].properties.percorso == mapData.features[i].properties.percorso) {

        a = lerpColor(from, to, map(timeData.features[k].properties.corse_gior, 0, busy_limit.max-20, 0, 1));
        h = map(timeData.features[k].properties.corse_gior, 0, busy_limit.max, 0, 255);
        day = timeData.features[k].properties.tipo_giorno;
        mezzo = timeData.features[k].properties.mezzo;


        colorMode(HSB, 255);
        stroke(a);

        if (((tram.status == true) && (mezzo == "TRAM") || ((bus.status == true) && (mezzo == "BUS"))) && (((week.status == true) && (day == "L")) || ((sat.status == true) && (day == "S")) || ((sun.status == true) && (day == "F")))) {
          beginShape();
          for (var j = 0; j < mapData.features[i].geometry.coordinates.length; j++) {
            var lon = mapData.features[i].geometry.coordinates[j][0];
            var lat = mapData.features[i].geometry.coordinates[j][1];
            var x = map(lon, city_limit.xMin, city_limit.xMax, 0 + paddingX, paddingX + (height / 1.1644));
            var y = map(lat, city_limit.yMin, city_limit.yMax, height - paddingY, 0 + paddingY);
            vertex(x, y);
          }
          endShape();
        }
      }
    }
  }

if (underground.status == true) {
  for (var i = 0; i < metroMapData.features.length; i++) {

    for (var k = 0; k < metroTimeData.features.length; k++) {

      if (metroTimeData.features[k].properties.percorso == metroMapData.features[i].properties.percorso) {
        a = lerpColor(from, to, map(metroTimeData.features[k].properties.corse_gior, 0, busy_limit.max, 0, 1));
        h = map(metroTimeData.features[k].properties.corse_gior, 0, busy_limit.max, 0, 255);
        day = metroTimeData.features[k].properties.tipo_giorno;
        mezzo = metroTimeData.features[k].properties.mezzo;

        colorMode(HSB, 255);
        stroke(a);

      if (((week.status == true) && (day == "L")) || ((sat.status == true) && (day == "S")) || ((sun.status == true) && (day == "F"))) {
          beginShape();
          for (var j = 0; j < metroMapData.features[i].geometry.coordinates.length; j++) {
            var lon = metroMapData.features[i].geometry.coordinates[j][0];
            var lat = metroMapData.features[i].geometry.coordinates[j][1];
            var x = map(lon, city_limit.xMin, city_limit.xMax, 0 + paddingX, paddingX + (height / 1.1644));
            var y = map(lat, city_limit.yMin, city_limit.yMax, height - paddingY, 0 + paddingY);
            vertex(x, y);
          }
          endShape();
        }
      }
    }
  }
}

  tram.show()
  bus.show()
  underground.show()

  week.show()
  sat.show()
  sun.show()
}
