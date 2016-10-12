import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';

@Component({
  templateUrl: 'build/pages/serverpage/serverpage.html'
})
export class ServerPage {
  private data:any;

  constructor(private navCtrl: NavController, private http:Http) {
    this.getData();
  }

  getData () {
    //let url:string = "http://localhost:8080/app/users";
    let url:string = 'https://iot-project.herokuapp.com/app/users';

      this.http.get(url).map(res => res.json())
        .subscribe(data => {
          this.data = data;
         // console.log(JSON.stringify(data));
        }, error => {
          console.log("Erro Get: "+error);
      });
  }
}
