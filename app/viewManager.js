export default class ViewManager {
  constructor() {
    //initialize variables
    let vessel;
    let outputNumber;
    let vesselOptions;
    let currentOutput = 1;
    let check = "";
    let well_24 = [];
    let well_96 = [];
    let well_384 = [];
    let counter = 0;
    let letters = ["A", "B", "C", "D", "E", "F", "G", "H"];
    let flowRate = 0;
    let volume = 0;
    let density = 0;
    let dispense_time = 0;
    let start = 0;

    well_24[0] = 1
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


    function checkString(str,id) {
      let str_num = parseInt(str,10);
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
    this.inputButton.addEventListener('click', function(event) {
      start = 1;
      vessel = document.getElementById('selectVessel').value;
      outputNumber = document.getElementById('outputNumber').value;
      flowRate = document.getElementById('inputFlow').value;
      volume = document.getElementById('inputVolume').value;
      density = document.getElementById('inputDensity').value;

      //Check that input values are valid
      checkString(outputNumber,"outputNumber");
      checkString(flowRate,"inputFlow");
      checkString(volume,"inputVolume");
      checkString(density,"inputDensity");

      //Calculate dispense time using model
      let sigma = 0.0415; // N*m
      let gravity = 9.8;  // m/(s^2)
      let diameter = 0.003175; // m
      let pi = 3.14;
      let model_volume = ((sigma*diameter*pi)/(density*gravity)) * 1000000;
      //console.log(model_volume);
      let droplet_time = model_volume * (3600/flowRate);
      //console.log(droplet_time);
      //console.log(Math.ceil(volume/model_volume));
      dispense_time = droplet_time * Math.ceil(volume/model_volume);
      //console.log(dispense_time);

      //Send data to Arduino after confirming validity of input information
      if (checkString(outputNumber,"outputNumber") && checkString(flowRate,"inputFlow") && checkString(volume,"inputVolume") && checkString(density,"inputDensity")){
        //Model
        let data = outputNumber; //add + dispense time
        socket.emit("send-raw", {
          "name": '/dev/cu.usbmodem1411',
          "payload": str2ab_newline(data)
        });
      };



      //create output tabs
      let nav = "";
      let nav_content = "";
      let vessel_ID = "";
      let thead_ID = "";
      let tbody_ID = "";
      let thead_array = [];
      let tbody_array = [];
      for (let k = 0; k < outputNumber; k++) {
        let output_insert = "Output" + (k + 1);
        let output_btn_ID = "Submit" + (k + 1);
        let output_btn_text = "Submit Output " + (k + 1);
        let navID = output_insert + "tab";
        let href_insert = "#" + output_insert;

        vessel_ID = "vessel" + k;
        thead_ID = "thead" + k;
        tbody_ID = "tbody" + k;

        thead_array.push(thead_ID)
        tbody_array.push(tbody_ID);
        nav += "<a class='nav-item nav-link text-dark' id='" + navID + "' data-toggle='tab' href='" + href_insert + "' role='tab' aria-controls='" + output_insert + "' aria-selected='false'>" + (k + 1) + "</a>";
        nav_content += "<div class='tab-pane fade' id='" + output_insert + "' role='tabpanel' aria-labelledby='" + navID + "'><table class='table table-bordered table-sm' id='" + vessel_ID + "'><thead id='" + thead_ID + "'></thead><tbody id='" + tbody_ID + "'></tbody></table><button onclick = 'submitXY(this)' class='btn btn-success' name = '"+k+"'id='" + output_btn_ID + "'>" + output_btn_text + "</button></div>";
      };

      document.getElementById('navTabs').innerHTML = nav;
      document.getElementById('navContent').innerHTML = nav_content;

      //create table for output vessel image
      //create 24-well plate
      if ((vessel == 24) && checkString(outputNumber,"outputNumber") && checkString(flowRate,"inputFlow") && checkString(volume,"inputVolume") && checkString(density,"inputDensity") ) {
        for (var k = 0; k < outputNumber; k++) {
          let thead_insert = "<th scope='col'> </th>";
          for (var i = 1; i < 7; i++) {
            thead_insert += "<th scope='col'>" + i + "</th>";
          };
          thead_insert += "</tr>";

          let tbody_insert = "";
          let letters = ["A", "B", "C", "D"];
          for (let i = 0; i < 4; i++) {
            tbody_insert += "<tr>";
            tbody_insert += "<th scope='row'>" + letters[i] + "</th>";
            for (let j = 1; j < 7; j++) {
              let coordinate = letters[i] + j;
              let btnID = coordinate + k;
              tbody_insert += "<td><button type='button' name='"+k+"' class='grid-button btn btn-sm text-white' onclick='appendXY(this)' value='" + j + "' id='" + btnID + "'>" + coordinate + "</button></td>";
            };
            tbody_insert += "</tr>";
          };

          document.getElementById(tbody_array[k]).innerHTML = tbody_insert;
          document.getElementById(thead_array[k]).innerHTML = thead_insert;
        };

        counter = 0;
        for (var k = 0; k < outputNumber; k++) {
          counter = 0;
          for (let i = 0; i < 4; i++) {
            for (let j = 1; j < 7; j++) {
              let identifier = letters[i] + j + k;
              document.getElementById(identifier).value = well_24[counter];
              counter = counter + 1;
            }
          }
        }
      };

      //create 96-well plate
      if ((vessel == 96) && checkString(outputNumber,"outputNumber") && checkString(flowRate,"inputFlow") && checkString(volume,"inputVolume") && checkString(density,"inputDensity")) {
        for (var k = 0; k < outputNumber; k++) {
          let thead_insert = "<th scope='col'> </th>";
          for (var i = 1; i < 13; i++) {
            thead_insert += "<th scope='col'>" + i + "</th>";
          };
          thead_insert += "</tr>";

          let tbody_insert = "";
          let letters = ["A", "B", "C", "D", "E", "F", "G", "H"];

          for (var i = 0; i < 8; i++) {
            tbody_insert += "<tr>";
            tbody_insert += "<th scope='row'>" + letters[i] + "</th>";
            for (var j = 1; j < 13; j++) {
              let coordinate = letters[i] + j;
              let btnID = coordinate + k;
              tbody_insert += "<td><button type='button' name='"+k+"' class='grid-button btn btn-sm text-white' onclick='appendXY(this)' value='" + coordinate + "' id='" + btnID + "'>" + coordinate + "</button></td>";
            };
            tbody_insert += "</tr>";
          };

          document.getElementById(tbody_array[k]).innerHTML = tbody_insert;
          document.getElementById(thead_array[k]).innerHTML = thead_insert;
        };

        counter = 0;
        for (let k = 0; k < outputNumber; k++) {
          counter = 0;
          for (var i = 0; i < 8; i++) {
            for (var j = 1; j < 13; j++) {
              let identifier = letters[i] + j + k;
              document.getElementById(identifier).value = well_96[counter];
              counter = counter + 1;
            };
          };
        };
      };

      //create 384-well plate
      if ((vessel == 384) && checkString(outputNumber,"outputNumber") && checkString(flowRate,"inputFlow") && checkString(volume,"inputVolume") && checkString(density,"inputDensity")) {
        for (var k = 0; k < outputNumber; k++) {
          let thead_insert = "<th scope='col'> </th>";
          for (var i = 1; i < 25; i++) {
            thead_insert += "<th scope='col'>" + i + "</th>";
          };
          thead_insert += "</tr>";

          let tbody_insert = "";
          let letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"];
          for (var i = 0; i < 15; i++) {
            tbody_insert += "<tr>";
            tbody_insert += "<th scope='row'>" + letters[i] + "</th>";
            for (var j = 1; j < 25; j++) {
              let coordinate = letters[i] + j;
              tbody_insert += "<td><button type='button' class='grid-button btn btn-sm text-white' onclick='appendXY(this)' value='" + coordinate + "' id='" + coordinate + "'>" + coordinate + "</button></td>";
            };
            tbody_insert += "</tr>";
          };
          document.getElementById(tbody_array[k]).innerHTML = tbody_insert;
          document.getElementById(thead_array[k]).innerHTML = thead_insert;
        };
      };
    });

    this.newButton.addEventListener('click', function(event) {
      let resetData = 'r';
      socket.emit("send-raw", {
        "name": '/dev/cu.usbmodem1411',
        "payload": str2ab_newline(resetData)
      });
    });

    this.startButton.addEventListener('click', function(event){
      let pi = 3.14;
      let nozzle_volume = (0.0008^2)*pi*0.18;
      let adapter_volume = (0.0008^2)*pi*0.24;
      let total_volume = nozzle_volume + adapter_volume;
      let flush_time = Math.ceil(((3600/flowRate)*total_volume)+180); //seconds
      let sendData = dispense_time.toString() + " " + flush_time.toString();
      if(start == 1){
        socket.emit("send-raw", {
          "name": '/dev/cu.usbmodem1411',
          "payload": str2ab_newline(sendData)
        });
      };
    });

  };
};
