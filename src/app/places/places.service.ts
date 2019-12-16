import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';

import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';
import { PlaceLocation } from './location.model';

interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
  location: PlaceLocation;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  // tslint:disable-next-line: variable-name
  private _places = new BehaviorSubject<Place[]>([]);

  constructor(private authService: AuthService,
              private http: HttpClient) { }

  get places() { // getter returns an observable 'places'
    return this._places.asObservable();
  }

  // Observable
  fetchPlaces() {
    return this.http.get<{ [key: string]: PlaceData}>('https://ion-bnb.firebaseio.com/offered-places.json')
    .pipe(map(responseData => {
      const places = [];
      for (const key in responseData) {
        if (responseData.hasOwnProperty(key)) {
          places.push(
            new Place(
              key,
              responseData[key].title,
              responseData[key].description,
              responseData[key].imageUrl,
              responseData[key].price,
              new Date(responseData[key].availableFrom),
              new Date(responseData[key].availableTo),
              responseData[key].userId,
              responseData[key].location
            )
          );
        }
      }
      return places;
      // return [];
    }),
      tap(places => {
        this._places.next(places);
      })
    );
  }

  getPlace(id: string) {
    return this.http.get<PlaceData>(`https://ion-bnb.firebaseio.com/offered-places/${id}.json`)
      .pipe(
        map(placeData => {
        return new Place(
          id,
          placeData.title,
          placeData.description,
          placeData.imageUrl,
          placeData.price,
          new Date(placeData.availableFrom),
          new Date(placeData.availableTo),
          placeData.userId,
          placeData.location
        );
     })
    );
    // return this.places.pipe(take(1), map(places => {
    //     return {...places.find(p => p.id === id)};
    //   })
    // );
  }

  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date, location: PlaceLocation) {
    let generatedId: string;
    let newPlace: Place;
    return this.authService.userId.pipe(
      take(1),
      switchMap(userId => {
      if (!userId) {
        throw new Error('No user found');
      }
      newPlace = new Place(
        Math.random().toString(),
        title,
        description,
        'https://i.pinimg.com/originals/e8/b6/99/e8b6998f0299ab41fd2389daf2230812.png', // to change
        price,
        dateFrom,
        dateTo,
        userId,
        location
      );
      return this.http.post<{name: string}>('https://ion-bnb.firebaseio.com/offered-places.json', { ...newPlace, id: null })
    }), switchMap(responseData => {
        generatedId = responseData.name;
        return this.places;
      }),
      take(1),
      tap(places => {
        newPlace.id = generatedId;
        this._places.next(places.concat(newPlace)); // emit new array (places concat a newPlace to it)
      })
    );
  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];
    return this.places.pipe(
      take(1),
      switchMap(places => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap(places => {
        const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId,
          oldPlace.location

        );
        return this.http.put(`https://ion-bnb.firebaseio.com/offered-places/${placeId}.json`,
          { ...updatedPlaces[updatedPlaceIndex], id: null }
        );
      }),
        tap(() => {
          this._places.next(updatedPlaces);
        })
    );
  }

}

// new Place(
//   'p1',
//   'Woolworth Building',
//   'In the heart of New York City',
//   'https://news.artnet.com/app/news-upload/2015/02/tom-baril-woolworth-building.jpg',
//   199.99,
//   new Date('2020-01-01'),
//   new Date('2020-12-31'),
//   'abc'
// ),
// new Place(
//   'p2',
//   'palazzo Massimo',
//   'Museo Nazionale Romano',
//   'https://govisity.com/wp-content/uploads/2018/07/National_Roman_Museum_-_Palazzo_Massimo_alle_Terme__Rome_Attractions__Best_Places_to_visit_in_Rome__Italy.jpg',
//   349.99,
//   new Date('2020-01-01'),
//   new Date('2020-12-31'),
//   'abc'
// ),
// new Place(
//   'p3',
//   'Victorian house',
//   'Quaint place',
//   'https://i.pinimg.com/originals/e8/b6/99/e8b6998f0299ab41fd2389daf2230812.png',
//   167.50,
//   new Date('2020-01-01'),
//   new Date('2020-12-31'),
//   'abc'
// )