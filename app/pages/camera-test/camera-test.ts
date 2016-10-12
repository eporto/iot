import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

declare var cordova;

@Component({
  templateUrl: 'build/pages/camera-test/camera-test.html',
})
export class CameraTestPage {
  
  constructor(private navCtrl: NavController, private platform: Platform) {
    
  }
  ionViewLoaded() {
    try {
      let tapEnabled = false; //enable tap take picture
      let dragEnabled = false; //enable preview box drag across the screen
      let toBack = true; //send preview box to the back of the webview
      let cameraRect = {  //preview reactangle
        x: 0, 
        y: 0, 
        width: this.platform.width(), 
        height: this.platform.height()
      };
 
      cordova.plugins.camerapreview.startCamera(cameraRect, "rear", tapEnabled, dragEnabled, toBack);
    }
    catch (e) {
      console.log(e);
    }
  }
  /*
  ionViewDidEnter() {
    console.log("ViewDidEnter");
  }
  ionViewWillEnter() {
    console.log("ViewWillEnter");
  }*/
}


