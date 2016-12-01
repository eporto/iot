import {Component} from '@angular/core';
import {NavController, Platform} from 'ionic-angular';

@Component({
  templateUrl: 'build/pages/serverpage/serverpage.html'
})

export class ServerPage {
  private w:any;
  private h:any;

  constructor(private navCtrl: NavController, public platform:Platform) {
    this.w = this.platform.width();
    this.h = this.platform.height();
    console.log(this.w+""+this.h);
  }

  
}
