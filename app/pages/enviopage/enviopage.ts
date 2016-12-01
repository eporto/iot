import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {GameService} from '../../providers/game-service/game-service';
import {TabsPage} from '../tabs/tabs';

@Component({
  templateUrl: 'build/pages/enviopage/enviopage.html'
})

export class EnvioPage {
  private players:any = null;

  constructor(private navCtrl: NavController, public gameService:GameService) {}

  ionViewLoaded() { 
    this.gameService.getGameScore((data) => {
      if(data) {
        console.log(data);
       
        this.players = data;
      }
      else 
        console.log("Error");
    });
  }

  exit() {
    this.navCtrl.setRoot(TabsPage);
  }
}
