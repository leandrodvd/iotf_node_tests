var iotf = require("ibmiotf");
var inquirer = require('inquirer');


var menuQuestions = [
  {
    type: 'list',
    name: 'simulatorType',
    message: 'What type of IoT entity you want to simulate?',
    choices: ['Device', 'Gateway', 'Application'],
    filter: function (val) {
      return val.toLowerCase();
    }
  }
]

var deviceSimulatorQuestions = [
  {
    type: 'input',
    name: 'org',
    message: 'Organization ID:',
  },
  {
    type: 'input',
    name: 'id',
    message: 'Device ID:',
  },
  {
    type: 'input',
    name: 'type',
    message: 'Device Type:',
  },
  {
    type: 'list',
    name: 'auth-method',
    message: 'Authentication Method:',
    choices: ['token'],
  },
  {
    type: 'input',
    name: 'auth-token',
    message: 'Authentication Token:',
  }
];

var qosQuestion = [
  {
    type: 'list',
    name: 'qos',
    message: 'QoS:',
    choices: [1,2,3],
  }
];

var publishIntervalQuestion = [
  {
    type: 'input',
    name: 'publishInterval',
    message: 'Publish interval (in miliseconds):',
    validate: function (value) {
      var valid = !isNaN(parseFloat(value));
      return valid || 'Please enter a number';
    },
    filter: Number
  }
]

// var config = {
//             "org" : "ol01l5",
//             "id" : "device00",
//             "type" : "generic_device",
//             "auth-method" : "token",
//             "auth-token" : "device00"
// };



function getReadline(){
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return rl;
}



function getPublishInterval(){
  var rl = getReadline();
  var interval;
  rl.question('What is the interval to publish data (in seconds)?', (answer) => {
    interval=answer;
  });
  return interval;
}

function getQoS(){
  var rl = getReadline();
  var qos=2;
  rl.question('What is the desired QoS (1, 2 or 3)?', (answer) => {
    if(!isNaN(answer) && answer>=1 && answer<=3){
      qos=Number(answer);
    }
    else{
      return getQoS();
    }
  });
  return qos;
}

function startDevicePublishing(config,qos,publishInterval){
  var deviceClient = new iotf.IotfDevice(config);

  //setting the log level to debug. By default its 'warn'
  deviceClient.log.setLevel('debug');

  deviceClient.connect();

  deviceClient.on('connect', function(){
          var i=0;
          console.log("connected");
          setInterval(function function_name () {
                  i++;
                  deviceClient.publish('myevt', 'json', '{"value":'+i+'}', qos);
          },publishInterval);
  });
}

function runDeviceSimulator(){
    console.log("Initializing Device Simulator");
    var config;
    var qos;
    var publishInterval;
    inquirer.prompt(deviceSimulatorQuestions).then(function (answers) {
      config=answers;
      inquirer.prompt(qosQuestion).then(function (answers) {
        qos=answers.qos;
        inquirer.prompt(publishIntervalQuestion).then(function (answers) {
          publishInterval=answers.publishInterval;
          startDevicePublishing(config,qos,publishInterval);
        });
      });
    });

}

function run(){
  inquirer.prompt(menuQuestions).then(function (answers) {
    console.log('\nAnswers:');
    console.log(JSON.stringify(answers, null, '  '));
    switch (answers.simulatorType) {
      case "device":
        runDeviceSimulator();
        break;
      case "gateway":
        console.log(answers.simulatorType + " simulator not implemented yet");
        break;
      case "application":
        console.log(answers.simulatorType + " simulator not implemented yet");
        break;
      default:
        console.log(answers.simulatorType + " simulator not implemented yet");

    }
  });
}



run();
