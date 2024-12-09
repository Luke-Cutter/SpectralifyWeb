// File: src/components/images/AlbumImage.jsx
import React from 'react';

export const AlbumImage = ({ number }) => {
  const albumMap = {
    1: {
      src: '/images/The_Speed_of_Cattle_cover.jpg',
      title: 'Archers of Loaf - South Carolina',
      alt: 'Archers of Loaf album cover'
    },
    2: {
      src: '/images/Yankee_Hotel_Foxtrot_(Front_Cover).png',
      title: 'Wilco - Pot Kettle Black',
      alt: 'Wilco album cover'
    },
    3: {
      src: '/images/wowee.jpg',
      title: 'Pavement - Give it a Day',
      alt: 'Pavement album cover'
    },
    4: {
      src: '/images/no_depression.jpg',
      title: 'Uncle Tupelo - No Depression',
      alt: 'Uncle Tupelo album cover'
    },
    5: {
      src: '/images/grandaddy.jpg',
      title: 'Grandaddy - A.M. 180',
      alt: 'Grandaddy album cover'
    },
    6: {
      src: '/images/evah.png',
      title: 'Spoon - Don\'t You Evah',
      alt: 'Spoon album cover'
    }
  };

  const album = albumMap[number];
  
  return (
    <div>
    <img 
      src={album.src} 
      alt={album.alt}
      className="w-full h-auto mb-2"
    />
    <p className="font-medium text-center">{album.title}</p>
  </div>
);
};