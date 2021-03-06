import { Component, OnInit, ViewChild, ElementRef, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-input-image',
  templateUrl: './input-image.component.html',
  styleUrls: ['./input-image.component.scss'],
})
export class InputImageComponent implements OnInit {
  
  @Input() options:any = {
    type: 'blob',
    size: { width: 500, height: 500 },
    format: 'png',
    quality: 1,
    circle: false
  };

  private _imageUrl:string;

  imageCrop: Croppie;

  imageFlipped: boolean = false;

  hovered: boolean = false;

  //hidePreview: boolean = true;

  @ViewChild('imageInput') imageInput:ElementRef;
  @ViewChild('imagePreview') imagePreview:ElementRef;

  @Output() change:EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
    if(this.imageUrl) {
      this.imagePreview.nativeElement.src = this.imageUrl;
    }
  }

  get imageUrl():string {
    return this._imageUrl;
  }

  @Input()
  set imageUrl(url:string) {
    this._imageUrl = url;
    this.imagePreview.nativeElement.src = url;
  }

  selectImage(files:FileList) {
    let file:File = files[0];
    if(file && file.type === 'image/jpeg' && FileReader) {
      //this.hidePreview = false;
      let fr = new FileReader();
      fr.onload = () => {
        this.imageUrl = fr.result;
        // this.imagePreview.nativeElement.src = fr.result;
        this.showCrop();
      };
      fr.readAsDataURL(file);
    }
    this.emitChange();
  }

  private showCrop() {
    if(this.imageCrop) this.imageCrop.destroy();
    this.imageCrop = new Croppie(this.imagePreview.nativeElement, {
      viewport: { width: 150, height: 150 },
      boundary: {width: 200, height: 200},
      enableOrientation: true,
      mouseWheelZoom: 'ctrl',
      update: () => {
        this.emitChange();
      }
    });
  }

  triggerInput() {
    this.imageInput.nativeElement.click();
  }

  rotateLeft() {
    this.imageCrop.rotate(90);
    this.emitChange();
  }

  rotateRight() {
    this.imageCrop.rotate(-90);
    this.emitChange();
  }

  flip() {
    this.imageCrop.bind({
      url: this.imageUrl,
      orientation: this.imageFlipped?1:2,
      zoom: this.imageCrop.get().zoom
    });
    this.imageFlipped = !this.imageFlipped;
  }

  async emitChange() {
    if(this.imageCrop) {
      let res = await this.imageCrop.result(this.options);
      this.change.emit({
        data: res
      });
    }
  }

  reset() {
    this.imageUrl = null;
    this.imageCrop.destroy();
    this.imagePreview.nativeElement.src = '';
  }

  // fileDragOver(hovered:boolean) {
  //   if(hovered) {
  //     this.hidePreview = true;
  //   }
  //   else {
  //     this.hidePreview = false;
  //     this.imageCrop && this.imageCrop.refresh();
  //   }
  // }

}
