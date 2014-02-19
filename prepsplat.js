//index.js database.csv searchterm1 searchterm2

// node samples/sample.js
var csv = require('csv');
var fs = require('fs');


csv()
.from.stream(fs.createReadStream(process.argv[2]))
.transform( function(row){
  row.unshift(row.pop());
  return row;
})
.on('record', function(row,index){

  var name = [row[6],"-",index].join("");
  if (index > 0 ) {

    //make sure meters are the units, rather than implicitly, feet
    if (row[11].indexOf("m") !== -1) {
      antennaHeight = row[11];
    }
    else {
      antennaHeight = [row[11],'m'].join("");
    }

    var qthTemplate = '{station-name}\n{longitude}\n{latitude}\n{antenna-height}\n';
    var qth = qthTemplate.replace('{station-name}', name)
                      .replace('{longitude}', row[8])
                      .replace('{latitude}', -row[9])
                      .replace('{antenna-height}', antennaHeight);

    fs.writeFile([name,".qth"].join(""), qth, function(err) {
      if(err) {
          console.log(err);
      } else {
          console.log(["The file ",name," was saved!"].join(""));
      }
    });

    var lrpTemplate = '15.000  ; Earth Dielectric Constant Relative permittivity\n0.005   ; Earth Conductivity (Siemens per meter)\n301.000 ; Atmospheric Bending Constant (N-units)\n{station-freq} ; Frequency in MHz (20 MHz to 20 GHz)\n2       ; Radio Climate (5 = Continental Temperate)\n{station-polarization}       ; Polarization (0 = Horizontal, 1 = Vertical)\n0.5     ; Fraction of situations (50% of locations)\n0.5     ; Fraction of time (50% of the time)\n{station-erp} ; Effective Radiated Power in Watts (optional)\n';

    //CSV polarization code is m, h or v
    var polarization = 0.5;
    if (row[15] === "h") {
      polarization = 0;
    } else if (row[15] === "v") {
      polarization = 1;
    }

    var antennaGain = parseFloat(row[12])
    var TxkWPower = parseFloat(row[10])

    //functions for gain calculation
    var dbw2watts = function (inValue) {
      return Math.round(Math.pow(10,eval(inValue)/10)*100000)/100000;
    }
    var watts2dbw = function (inValue) {
      return Math.round(10 * Math.log(eval(inValue))/Math.LN10 * 100000)/100000;
    }

    //from http://www.csgnetwork.com/antennaecalc.html
    var dipoleGain = 10 * Math.log(1.64)/Math.LN10;
    var stationERP = dbw2watts(watts2dbw(TxkWPower*1000) + antennaGain - dipoleGain);

    var lrp = lrpTemplate.replace('{station-name}', name)
                      .replace('{station-polarization}', polarization)
                      .replace('{station-freq}', row[1]/1000)
                      .replace('{station-erp}', stationERP);

      fs.writeFile([name,".lrp"].join(""), lrp, function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log(["The file ",name," was saved!"].join(""));
        }
      });
  }

  //console.log('#'+index+' '+JSON.stringify(row));
  console.log('#'+index +' '+ [row[6],row[7],row[8],row[9],row[10],row[11]].join(","))
})
.on('end', function(count){
  console.log('Number of lines: '+count);
})
.on('error', function(error){
  console.log(error.message);
});
// #0 ["2000-01-01","20322051544","1979.0","8.8017226E7","ABC","45"]
// #1 ["2050-11-27","28392898392","1974.0","8.8392926E7","DEF","23"]
// Number of lines: 2
//
