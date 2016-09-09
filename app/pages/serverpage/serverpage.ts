import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {Http} from '@angular/http';

@Component({
  templateUrl: 'build/pages/serverpage/serverpage.html'
})
export class ServerPage {
  private data:any;
  constructor(private navCtrl: NavController, private http:Http) {
    this.getData();
  }

  getData () {
    let url:string = "https://iot-project-shido.c9users.io/res/data";
    this.http.get(url).subscribe(res => {
    this.data = res.json();
    console.log("res: "+res);
    console.log("this.data: "+this.data);
    })
  }
}
