import { Component, OnInit } from '@angular/core';
import { Battery } from '../../models/Battery';
import { DeviceData } from '../../models/DeviceData';
import { PowerDashboardService } from '../../services/power-dashboard.service'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  batteryData : Battery[];
  schoolData : any;
  deviceData : any;
  schools : string[];
  devices : any;
  constructor(private batteryService : PowerDashboardService) { }

  ngOnInit() {
      this.batteryService.getBatteryData().subscribe(batteryData => {
      this.batteryData = batteryData;
      
      let data = findSchool(this.batteryData);
      this.schoolData = data.schoolData;
      this.devices = data.unHealthyDevice;
      this.schools = Object.keys(this.schoolData);
      console.log(this.schoolData);
      console.log(this.devices);
     });


    
  }

}

function findSchool(data:Battery[]){
  let schoolDict = {};
  let schoolData = {};
  let unHealthyDevice = [];
  
  for( let i=0; i <data.length; i++){
    let tempDevice:Battery = data[i];
    if(!schoolDict[tempDevice.academyId]){
      schoolDict[tempDevice.academyId] = [];
    }
    schoolDict[tempDevice.academyId].push(tempDevice)
    
  }

  for( let school in schoolDict){
    let schoolObj : any = mapdeviceBattery(schoolDict[school], school);
    schoolData[school] = schoolObj.deviceDict;
    if (schoolObj.devicesWithIssues) {
      unHealthyDevice.push(schoolObj.devicesWithIssues);
    }
    
  }

  return {"schoolData" : schoolData,
            "unHealthyDevice" : unHealthyDevice 
}
}

function mapdeviceBattery(school,schoolName){
  let deviceDict : any = {};
  for( let i=0; i <school.length; i++){
    if(!deviceDict[school[i].serialNumber]){
      let deviceData : DeviceData = {
        "batteryLevel" : school[i].batteryLevel,
        "timestamp" : school[i].timestamp,
        "avgBatteryConsumption" : 0,
        "initialTimeStamp" : school[i].timestamp,
        "devicesWithIssues" : 0,
        "totalHoursUsed": 0,
        "totalBatteryConsumed": 0,
        "serialNumber" : school[i].serialNumber,
        "schoolName" : schoolName
      };

      deviceDict[school[i].serialNumber] = deviceData;
    }

    if((Date.parse(school[i].timestamp) - Date.parse(deviceDict[school[i].serialNumber]["timestamp"]) ) > 0){
      let batteryInfo = findavgBatteryConsumption (deviceDict[school[i].serialNumber], school[i]);
      deviceDict[school[i].serialNumber]["avgBatteryConsumption"] = 24 * (batteryInfo.totalBatteryConsumed/batteryInfo.totalHoursUsed);

      deviceDict[school[i].serialNumber]["totalBatteryConsumed"] = batteryInfo.totalBatteryConsumed;
      deviceDict[school[i].serialNumber]["totalHoursUsed"] = batteryInfo.totalHoursUsed;
      deviceDict[school[i].serialNumber]["timestamp"] = school[i].timestamp;
      deviceDict[school[i].serialNumber]["batteryLevel"] = school[i].batteryLevel;
     }else{
      deviceDict[school[i].serialNumber]["avgBatteryConsumption"] = 100 * (1 - deviceDict[school[i].serialNumber]["batteryLevel"]) ;
     }
  }

  let devicesWithIssuesObject = findDevicesWithIssues(deviceDict);
  deviceDict.devicesWithIssues = devicesWithIssuesObject.issueDevice;
  let devicesWithIssues = {};
  let result = {"deviceDict" : deviceDict};
  if (devicesWithIssuesObject.unHealthyDevice.length != 0) {
    devicesWithIssues["name"] = devicesWithIssuesObject.unHealthyDevice;
    result["devicesWithIssues"] = devicesWithIssues;
  } 

  return result;
}

function findavgBatteryConsumption(deviceold, deviceNew){
  let timeDiff = (Date.parse(deviceNew.timestamp) - Date.parse(deviceold.initialTimeStamp));
  if( deviceNew.batteryLevel < deviceold.batteryLevel){
    let batteryDiff = (deviceold.batteryLevel - deviceNew.batteryLevel) * 100;

    return {
      "totalHoursUsed" : timeDiff/3600000,
      "totalBatteryConsumed" : batteryDiff + deviceold.totalBatteryConsumed
    };

  } 

    return {
      "totalHoursUsed" : deviceold.totalHoursUsed,
      "totalBatteryConsumed" : deviceold.totalBatteryConsumed
    }  
}
  
function findDevicesWithIssues(schoolData:any){
  let noOfDevices = 0;
  let unHealthyDevice = [];
  for(let device in schoolData){
    if(schoolData[device]["avgBatteryConsumption"] > 20){
      noOfDevices++;
      unHealthyDevice.push(schoolData[device]);
    }
  }
  return {
            "issueDevice" : noOfDevices,
            "unHealthyDevice": unHealthyDevice
          }
        }
