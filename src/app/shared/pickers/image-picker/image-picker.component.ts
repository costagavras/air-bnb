import { Component, OnInit, Output, ViewChild, ElementRef, EventEmitter, Input } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Capacitor, Plugins, CameraSource, CameraResultType } from '@capacitor/core';

@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls: ['./image-picker.component.scss'],
})
export class ImagePickerComponent implements OnInit {
  @ViewChild('filePicker', {static: false}) filePickerRef: ElementRef<HTMLInputElement>;
  @Output() imagePick = new EventEmitter<string | File>();
  @Input() showPreview = false;
  selectedImage: string;
  selectedImagePath: string;
  usePicker = false;

  constructor(private platform: Platform) { }

  ngOnInit() {
    console.log('Mobile:', this.platform.is('mobile')); // seen as mobile
    console.log('Hybrid:', this.platform.is('hybrid'));
    console.log('iOS:', this.platform.is('ios'));  // seen as mobile & iOS
    console.log('Android:', this.platform.is('android')); // seen as mobile & Android
    console.log('Desktop:', this.platform.is('desktop')); // desktop mode
    if (this.platform.is('mobile') && !this.platform.is('hybrid') || this.platform.is('desktop')) {
      this.usePicker = true;
    }
  }

  onPickImage() {
    // if (!Capacitor.isPluginAvailable('Camera') || this.usePicker) {
    if (!Capacitor.isPluginAvailable('Camera')) {
      this.filePickerRef.nativeElement.click();
      return;
    }
    Plugins.Camera.getPhoto({
      quality: 50,
      source: CameraSource.Prompt,
      correctOrientation: true,
      height: 320,
      width: 200,
      resultType: CameraResultType.Base64
    })
      .then(image => {
        this.selectedImage = 'data:image/jpeg;base64,' + image.base64String;
        this.imagePick.emit(image.base64String);
      })
      .catch(error => {
        console.log(error);
        if (this.usePicker) {
          this.filePickerRef.nativeElement.click();
        }
        return false;
      });
  }

  onFileChosen(event: Event) {
    const pickedFile = (event.target as HTMLInputElement).files[0];
    if (!pickedFile) {
      return;
    }
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const dataUrl = fileReader.result.toString();
      this.selectedImage = dataUrl;
      this.imagePick.emit(pickedFile);
    };
    fileReader.readAsDataURL(pickedFile);
  }

}
