import {Component} from '@angular/core';
import {Platform, ionicBootstrap} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
/*import {TabsPage} from './pages/tabs/tabs';
import {CameraTestPage} from './pages/camera-test/camera-test';*/
import {LoginPage} from './pages/login/login';
import {GameService} from './providers/game-service/game-service';

@Component({
  template: '<ion-nav [root]="rootPage"></ion-nav>',
  providers:[GameService]
})
export class MyApp {

  private rootPage: any;

  constructor(private platform: Platform) {
    this.rootPage = LoginPage;

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      
    });
  }
}

ionicBootstrap(MyApp);
