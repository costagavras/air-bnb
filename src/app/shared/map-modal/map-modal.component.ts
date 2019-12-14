import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Renderer2, OnDestroy, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { googleMapsKey } from '../../../environments/environment';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('map', {static: false}) mapElementRef: ElementRef;
  @Input() center =  { lat: 45.184, lng: 9.154 };
  @Input() selectable = true;
  @Input() closeButtonText = 'Cancel';
  @Input() title = 'Pick Location';
  clickListener: any;
  googleMaps: any;

  constructor(private modalCtrl: ModalController,
              private renderer: Renderer2) { }

  ngOnInit() {}

  ngAfterViewInit() {
    this.getGoogleMaps().then(googleMaps => {
      this.googleMaps = googleMaps;
      const mapElement = this.mapElementRef.nativeElement;
      const map = new googleMaps.Map(mapElement, {
        center: this.center,
        zoom: 14
      });

      this.googleMaps.event.addListenerOnce(map, 'idle', () => {
        this.renderer.addClass(mapElement, 'visible');
      });

      if (this.selectable) {
        this.clickListener = map.addListener('click', event => {
          const selectedCoords = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          };
          this.modalCtrl.dismiss(selectedCoords);
        });
      } else {
        const marker = new googleMaps.Marker({
          position: this.center,
          map, // shortcut for 'map: map,'
          title: 'Picked Location'
        });
        marker.setMap(map);
      }
    })
    .catch(error => {
      console.log(error);
    });
  }

  onCancel() {
    this.modalCtrl.dismiss();
  }

  private getGoogleMaps(): Promise<any> {
    const win = window as any;
    const googleModule = win.google;
    if (googleModule && googleModule.maps) {
      return Promise.resolve(googleModule.maps);
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsKey}`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const loadedGoogleModule = win.google;
        if (loadedGoogleModule && loadedGoogleModule.maps) {
          resolve(loadedGoogleModule.maps);
        } else {
          reject('Google maps SDK is not available')
        }
      };
    });
  }

  ngOnDestroy() {
    if (this.clickListener) {
      this.googleMaps.event.removeListener(this.clickListener);
    }
  }

}
