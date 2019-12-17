import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

import { PlacesService } from '../../places.service';
import { PlaceLocation } from '../../location.model';

function base64toBlob(base64Data, contentType) {
  contentType = contentType || '';
  const sliceSize = 1024;
  const byteCharacters = atob(base64Data);
  const bytesLength = byteCharacters.length;
  const slicesCount = Math.ceil(bytesLength / sliceSize);
  const byteArrays = new Array(slicesCount);

  for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    const begin = sliceIndex * sliceSize;
    const end = Math.min(begin + sliceSize, bytesLength);

    const bytes = new Array(end - begin);
    for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  return new Blob(byteArrays, { type: contentType });
}

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss'],
})
export class NewOfferPage implements OnInit {
  form: FormGroup;

  constructor(private placeService: PlacesService,
              private router: Router,
              private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      description: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(180)]
      }),
      price: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.min(1)]
      }),
      dateFrom: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      dateTo: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      mapLocation: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null)
    });
  }

  onLocationPicked(location: PlaceLocation) {
    this.form.patchValue({mapLocation: location});
  }

  onImagePicked(imageData: string | File) {
    let imageFile;
    if (typeof imageData === 'string') { // 'url'
      try {
        // const base64ContentArray = imageData.split(',');
        // const mimeType = base64ContentArray[0].match(/[^:\s*]\w+\/[\w-+\d.]+(?=[;| ])/)[0];
        // imageFile = base64toBlob(base64ContentArray[1], mimeType);
        imageFile = base64toBlob(imageData.replace('data:image/jpeg;base64,', ''), 'image/jpeg');
      } catch (error) {
        console.log(error);
        return;
      }
    } else { // file
      imageFile = imageData;
    }
    this.form.patchValue({ image: imageFile });
  }

  onCreateOffer() {
    if (!this.form.valid || !this.form.get('image').value) { // check also if image is null (not set);
      return;
    }
    console.log(this.form.value);
    this.loadingCtrl.create({
      message: 'Creating place...'
    }).then(loadingEl => {
      loadingEl.present();
      this.placeService.addPlace( // returns an observable to which I subscribe;
        this.form.value.title,
        this.form.value.description,
        +this.form.value.price,
        new Date(this.form.value.dateFrom),
        new Date(this.form.value.dateTo),
        this.form.value.mapLocation
      ).subscribe(() => {
        loadingEl.dismiss();
        this.form.reset();
        this.router.navigate(['/places/tabs/offers']);
      });
    });
  }
}
