import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {EnvioPage} from '../enviopage/enviopage';
import {ServerPage} from '../serverpage/serverpage';
import {BeaconPage} from '../beaconpage/beaconpage';

@Component({
  templateUrl: 'build/pages/tabs/tabs.html'
})

export class TabsPage {
  private enviobtn: any;
  private serverbtn: any;
  private beaconbtn: any;
  private userData:any;
  
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.enviobtn = EnvioPage;
    this.serverbtn = ServerPage;
    this.beaconbtn = BeaconPage;

    this.userData = { 
      name: this.navParams.get('name'),
      token: this.navParams.get('token') 
    };
  }

  changePage (page:any) {
    this.navCtrl.push(page);
  }
}
