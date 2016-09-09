/*import {Component} from '@angular/core';
import {HomePage} from '../home/home';
import {AboutPage} from '../about/about';
import {ContactPage} from '../contact/contact';

@Component({
  templateUrl: 'build/pages/tabs/tabs.html'
})
export class TabsPage {

  private tab1Root: any;
  private tab2Root: any;
  private tab3Root: any;

  constructor() {
    // this tells the tabs component which Pages
    // should be each tab's root Page
    this.tab1Root = HomePage;
    this.tab2Root = AboutPage;
    this.tab3Root = ContactPage;
  }
}*/

import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {EnvioPage} from '../enviopage/enviopage';
import {ServerPage} from '../serverpage/serverpage';

@Component({
  templateUrl: 'build/pages/tabs/tabs.html'
})

export class TabsPage {
  private enviobtn: any;
  private serverbtn: any;
  private beaconbtn: any;

  constructor(public navCtrl: NavController) {
    this.enviobtn = EnvioPage;
    this.serverbtn = ServerPage;
  }

  changePage (page:any) {
    this.navCtrl.push(page);
  }
}
