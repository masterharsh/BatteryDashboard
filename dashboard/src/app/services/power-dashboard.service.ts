import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Battery } from '../models/Battery';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PowerDashboardService {

  deviceDataUrl:string = 'http://localhost:3000'

  constructor(private http: HttpClient) { }

 

  getBatteryData(): Observable<Battery[]> {
    var headers = new HttpHeaders();
    headers.append("Access-Control-Allow-Origin", "*");
    return this.http.get<Battery[]>(`${this.deviceDataUrl}/deviceData`);
  }



  

}
