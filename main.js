(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var _viewManager = require('./viewManager');

var _viewManager2 = _interopRequireDefault(_viewManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var viewmanager = new _viewManager2.default();

},{"./viewManager":2}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ViewManager = function ViewManager() {
  _classCallCheck(this, ViewManager);

  //initialize variables
  var vessel = void 0;
  var outputNumber = void 0;
  var vesselOptions = void 0;
  var currentOutput = 1;
  var check = "";
  var well_24 = [];
  var well_96 = [];
  var well_384 = [];
  var counter = 0;
  var letters = ["A", "B", "C", "D", "E", "F", "G", "H"];
  var flowRate = 0;
  var volume = 0;
  var density = 0;
  var dispense_time = 0;
  var start = 0;

  well_24[0] = 1;
  for (var i = 1; i < 384; i++) {
    well_24[i] = i + 1;
  };

  well_96[0] = 1;
  for (var i = 1; i < 96; i++) {
    well_96[i] = i + 1;
  };

  well_384[0] = 1;
  for (var i = 1; i < 384; i++) {
    well_384[i] = i + 1;
  }

  //methods
  function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
  };

  function str2ab_newline(str) {
    str = str + '\n';
    var buf = new ArrayBuffer(str.length); // 2 bytes for each char
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    };
    return buf;
  };

  function str2ab(str) {
    var buf = new ArrayBuffer(str.length); // 2 bytes for each char
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    };
    return buf;
  };

  function checkString(str, id) {
    var str_num = parseInt(str, 10);
    if (str_num > 0) {
      document.getElementById(id).style.borderColor = "green";
      document.getElementById(id).style.borderWidth = "0.15rem";
      return true;
    } else {
      document.getElementById(id).style.borderColor = "red";
      document.getElementById(id).style.borderWidth = "0.15rem";
      return false;
    }
  };

  //buttons
  this.inputButton = document.getElementById("inputButton");
  this.newButton = document.getElementById("resetButton");
  this.startButton = document.getElementById("startButton");

  //event handlers
  this.inputButton.addEventListener('click', function (event) {
    start = 1;
    vessel = document.getElementById('selectVessel').value;
    outputNumber = document.getElementById('outputNumber').value;
    flowRate = document.getElementById('inputFlow').value;
    volume = document.getElementById('inputVolume').value;
    density = document.getElementById('inputDensity').value;

    //Check that input values are valid
    checkString(outputNumber, "outputNumber");
    checkString(flowRate, "inputFlow");
    checkString(volume, "inputVolume");
    checkString(density, "inputDensity");

    //Calculate dispense time using model
    var sigma = 0.0415; // N*m
    var gravity = 9.8; // m/(s^2)
    var diameter = 0.003175; // m
    var pi = 3.14;
    var model_volume = sigma * diameter * pi / (density * gravity) * 1000000;
    //console.log(model_volume);
    var droplet_time = model_volume * (3600 / flowRate);
    //console.log(droplet_time);
    //console.log(Math.ceil(volume/model_volume));
    dispense_time = droplet_time * Math.ceil(volume / model_volume);
    //console.log(dispense_time);

    //Send data to Arduino after confirming validity of input information
    if (checkString(outputNumber, "outputNumber") && checkString(flowRate, "inputFlow") && checkString(volume, "inputVolume") && checkString(density, "inputDensity")) {
      //Model
      var data = outputNumber; //add + dispense time
      socket.emit("send-raw", {
        "name": '/dev/cu.usbmodem1411',
        "payload": str2ab_newline(data)
      });
    };

    //create output tabs
    var nav = "";
    var nav_content = "";
    var vessel_ID = "";
    var thead_ID = "";
    var tbody_ID = "";
    var thead_array = [];
    var tbody_array = [];
    for (var _k = 0; _k < outputNumber; _k++) {
      var output_insert = "Output" + (_k + 1);
      var output_btn_ID = "Submit" + (_k + 1);
      var output_btn_text = "Submit Output " + (_k + 1);
      var navID = output_insert + "tab";
      var href_insert = "#" + output_insert;

      vessel_ID = "vessel" + _k;
      thead_ID = "thead" + _k;
      tbody_ID = "tbody" + _k;

      thead_array.push(thead_ID);
      tbody_array.push(tbody_ID);
      nav += "<a class='nav-item nav-link text-dark' id='" + navID + "' data-toggle='tab' href='" + href_insert + "' role='tab' aria-controls='" + output_insert + "' aria-selected='false'>" + (_k + 1) + "</a>";
      nav_content += "<div class='tab-pane fade' id='" + output_insert + "' role='tabpanel' aria-labelledby='" + navID + "'><table class='table table-bordered table-sm' id='" + vessel_ID + "'><thead id='" + thead_ID + "'></thead><tbody id='" + tbody_ID + "'></tbody></table><button onclick = 'submitXY(this)' class='btn btn-success' name = '" + _k + "'id='" + output_btn_ID + "'>" + output_btn_text + "</button></div>";
    };

    document.getElementById('navTabs').innerHTML = nav;
    document.getElementById('navContent').innerHTML = nav_content;

    //create table for output vessel image
    //create 24-well plate
    if (vessel == 24 && checkString(outputNumber, "outputNumber") && checkString(flowRate, "inputFlow") && checkString(volume, "inputVolume") && checkString(density, "inputDensity")) {
      for (var k = 0; k < outputNumber; k++) {
        var thead_insert = "<th scope='col'> </th>";
        for (var i = 1; i < 7; i++) {
          thead_insert += "<th scope='col'>" + i + "</th>";
        };
        thead_insert += "</tr>";

        var tbody_insert = "";
        var _letters = ["A", "B", "C", "D"];
        for (var _i = 0; _i < 4; _i++) {
          tbody_insert += "<tr>";
          tbody_insert += "<th scope='row'>" + _letters[_i] + "</th>";
          for (var _j = 1; _j < 7; _j++) {
            var coordinate = _letters[_i] + _j;
            var btnID = coordinate + k;
            tbody_insert += "<td><button type='button' name='" + k + "' class='grid-button btn btn-sm text-white' onclick='appendXY(this)' value='" + _j + "' id='" + btnID + "'>" + coordinate + "</button></td>";
          };
          tbody_insert += "</tr>";
        };

        document.getElementById(tbody_array[k]).innerHTML = tbody_insert;
        document.getElementById(thead_array[k]).innerHTML = thead_insert;
      };

      counter = 0;
      for (var k = 0; k < outputNumber; k++) {
        counter = 0;
        for (var _i2 = 0; _i2 < 4; _i2++) {
          for (var _j2 = 1; _j2 < 7; _j2++) {
            var identifier = letters[_i2] + _j2 + k;
            document.getElementById(identifier).value = well_24[counter];
            counter = counter + 1;
          }
        }
      }
    };

    //create 96-well plate
    if (vessel == 96 && checkString(outputNumber, "outputNumber") && checkString(flowRate, "inputFlow") && checkString(volume, "inputVolume") && checkString(density, "inputDensity")) {
      for (var k = 0; k < outputNumber; k++) {
        var _thead_insert = "<th scope='col'> </th>";
        for (var i = 1; i < 13; i++) {
          _thead_insert += "<th scope='col'>" + i + "</th>";
        };
        _thead_insert += "</tr>";

        var _tbody_insert = "";
        var _letters2 = ["A", "B", "C", "D", "E", "F", "G", "H"];

        for (var i = 0; i < 8; i++) {
          _tbody_insert += "<tr>";
          _tbody_insert += "<th scope='row'>" + _letters2[i] + "</th>";
          for (var j = 1; j < 13; j++) {
            var _coordinate = _letters2[i] + j;
            var _btnID = _coordinate + k;
            _tbody_insert += "<td><button type='button' name='" + k + "' class='grid-button btn btn-sm text-white' onclick='appendXY(this)' value='" + _coordinate + "' id='" + _btnID + "'>" + _coordinate + "</button></td>";
          };
          _tbody_insert += "</tr>";
        };

        document.getElementById(tbody_array[k]).innerHTML = _tbody_insert;
        document.getElementById(thead_array[k]).innerHTML = _thead_insert;
      };

      counter = 0;
      for (var _k2 = 0; _k2 < outputNumber; _k2++) {
        counter = 0;
        for (var i = 0; i < 8; i++) {
          for (var j = 1; j < 13; j++) {
            var _identifier = letters[i] + j + _k2;
            document.getElementById(_identifier).value = well_96[counter];
            counter = counter + 1;
          };
        };
      };
    };

    //create 384-well plate
    if (vessel == 384 && checkString(outputNumber, "outputNumber") && checkString(flowRate, "inputFlow") && checkString(volume, "inputVolume") && checkString(density, "inputDensity")) {
      for (var k = 0; k < outputNumber; k++) {
        var _thead_insert2 = "<th scope='col'> </th>";
        for (var i = 1; i < 25; i++) {
          _thead_insert2 += "<th scope='col'>" + i + "</th>";
        };
        _thead_insert2 += "</tr>";

        var _tbody_insert2 = "";
        var _letters3 = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"];
        for (var i = 0; i < 15; i++) {
          _tbody_insert2 += "<tr>";
          _tbody_insert2 += "<th scope='row'>" + _letters3[i] + "</th>";
          for (var j = 1; j < 25; j++) {
            var _coordinate2 = _letters3[i] + j;
            _tbody_insert2 += "<td><button type='button' class='grid-button btn btn-sm text-white' onclick='appendXY(this)' value='" + _coordinate2 + "' id='" + _coordinate2 + "'>" + _coordinate2 + "</button></td>";
          };
          _tbody_insert2 += "</tr>";
        };
        document.getElementById(tbody_array[k]).innerHTML = _tbody_insert2;
        document.getElementById(thead_array[k]).innerHTML = _thead_insert2;
      };
    };
  });

  this.newButton.addEventListener('click', function (event) {
    var resetData = 'r';
    socket.emit("send-raw", {
      "name": '/dev/cu.usbmodem1411',
      "payload": str2ab_newline(resetData)
    });
  });

  this.startButton.addEventListener('click', function (event) {
    var pi = 3.14;
    var nozzle_volume = (0.0008 ^ 2) * pi * 0.18;
    var adapter_volume = (0.0008 ^ 2) * pi * 0.24;
    var total_volume = nozzle_volume + adapter_volume;
    var flush_time = Math.ceil(3600 / flowRate * total_volume + 180); //seconds
    var sendData = dispense_time.toString() + " " + flush_time.toString();
    if (start == 1) {
      socket.emit("send-raw", {
        "name": '/dev/cu.usbmodem1411',
        "payload": str2ab_newline(sendData)
      });
    };
  });
};

exports.default = ViewManager;
;

},{}]},{},[1]);
