import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {Http} from '@angular/http';

@Component({
  templateUrl: 'build/pages/enviopage/enviopage.html'
})
export class EnvioPage {
  private data:any = {
    varString: "",
    varNum: 0
  }
//  public res:any;

  constructor(private navCtrl: NavController, private http:Http) {

  }

enviarDados() {
  let url:string = "https://iot-project-shido.c9users.io/res/save";
  let dataToSend:any = this.data; //Não enviada quando eu transformava em String/Json

  this.http.post(url,dataToSend).subscribe(res => {
    //fazer algo com o res
    /*  this.res = res.json();*/
      console.log(res);
    }, error => {
      console.log("Erro post!");
  });
}

}
