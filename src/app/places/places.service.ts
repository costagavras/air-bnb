import { Injectable } from '@angular/core';
import { Place } from './place.model';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places: Place[] = [
    new Place(
      'p1',
      'Woolworth Building',
      'In the heart of New York City',
      'https://news.artnet.com/app/news-upload/2015/02/tom-baril-woolworth-building.jpg',
      199.99
    ),
    new Place(
      'p2',
      'palazzo Massimo',
      'Museo Nazionale Romano',
      'https://govisity.com/wp-content/uploads/2018/07/National_Roman_Museum_-_Palazzo_Massimo_alle_Terme__Rome_Attractions__Best_Places_to_visit_in_Rome__Italy.jpg',
      349.99
    ),
    new Place(
      'p3',
      'Victorian house',
      'Quaint place',
      'https://i.pinimg.com/originals/e8/b6/99/e8b6998f0299ab41fd2389daf2230812.png',
      167.50
    )
  ];

  constructor() { }

  get places() {
    return [...this._places];
  }

  getPlace(id: string) {
    return {...this._places.find(p => p.id === id)};
  }

}
