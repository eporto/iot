import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {IBeacon} from 'ionic-native';

@Component({
  templateUrl: 'build/pages/beaconpage/beaconpage.html'
})
export class BeaconPage {
  private ison:boolean = false;
  private err:any = "ERRORS_MESSAGES";
  private beacon:any = "DATA_MESSAGES";
  private rangebeacons:any = "";
  private monitorbeacons:any = "";
  private enterregionbeacons:any ="";
  private regionerror:any = "";
  private delegate:any;
  private debug:number = 0;

  constructor(private navCtrl: NavController) {
    try {
      IBeacon.requestAlwaysAuthorization();
      this.delegate = IBeacon.Delegate();
      this.locate();
    } catch (e) {
      this.err = e.message;
    } finally {

      this.debug++;
    }

  }

   locate () {
    //!this.ison;
    //TO ON


    //Cria uma região de Beacon (nome e UUID) -> Identificador do Beacon a ser procurado
    //IBeacon.BeaconRegion(ident:string, uuid:string, major?:number, minor?:number): Region
    let region = IBeacon.BeaconRegion("OC:F3:EE:03:F5:AD", "003E8C80-EA01-4EBB-B888-78DA19DF9E55"); //BRTAG
  //  let region = IBeacon.BeaconRegion("OC:F3:EE:03:F5:AD", "003e8c80-ea01-4ebb-b888-78da19df9e55");
    //Começa monitoramento de uma região
    IBeacon.startMonitoringForRegion(region)
      .then(
        () => {
            this.regionerror = "Start Monitor!";
          }, //console.log("Started Monitoring !"),
        error => {/*console.error("Error startMonitoringForRegion: "+error)*/
          this.err = error;
      }
      );

    //.subscribe(function(data) {}, function(error){} );
    //Sempre que ele entrar no Range de um beacon, vai chamar o subscribe(data,error)
    this.delegate.didRangeBeaconsInRegion().subscribe(
      data =>  {
        console.log("didRangeBeaconsInRegion data: "+data);
        this.rangebeacons = data;
      },
      error => this.err = error//console.error()
      //this.distance=pluginResult.beacons[0].rssi;
    );

    //Sempre que começar a monitorar uma região vai chamar o subscribe(data,error)
    this.delegate.didStartMonitoringForRegion().subscribe(
      data => {
        console.log("didStartMonitoringForRegion data: "+data);
        this.monitorbeacons = data.beacons[0];
      },
      error =>this.err = error// console.error()
    );

    //Sempre que entrar em uma região onde foi marcada uma monitoração
    this.delegate.didEnterRegion().subscribe(
      data => {
        console.log("didEnterRegion data: "+data);
        this.enterregionbeacons = data;
      }
    );



  }
}
