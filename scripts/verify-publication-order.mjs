import assert from 'node:assert/strict';
import { comparePublications, isUndatedInPress, publicationSortDate } from '../lib/publication-order.ts';
const rows = [
  {title:'Older publication',year:2025,date:'2025-04-28',sortOrder:0},
  {title:'Newest publication',year:2026,date:'2026-09-03',sortOrder:99},
  {title:'Undated ordinary article',year:2026,date:'',sortOrder:0},
  {title:'In press by category',year:2026,date:'',category:'In press',sortOrder:50},
  {title:'In press by citation',year:2026,date:'',citation:'In Press',sortOrder:60},
  {title:'Dated in press',year:2026,date:'2026-08-12',category:'In press',sortOrder:0},
];
assert.deepEqual([...rows].sort(comparePublications).map(x=>x.title), [
  'In press by category','In press by citation','Newest publication','Dated in press','Older publication','Undated ordinary article',
]);
assert.deepEqual([...rows].sort((a,b)=>comparePublications(a,b,'oldest')).map(x=>x.title), [
  'In press by category','In press by citation','Older publication','Dated in press','Newest publication','Undated ordinary article',
]);
console.log('Publication ordering: publication dates and undated in-press priority passed.');
const mixedDates = [
  { title: 'Release date selected', year: 2026, date: '2026-01-10', releaseDate: '2026-10-12', publicationSortBy: 'releaseDate', sortOrder: 0 },
  { title: 'Posting date selected', year: 2026, date: '2026-08-01', releaseDate: '2026-12-01', publicationSortBy: 'date', sortOrder: 0 },
  { title: 'Existing record defaults to posting date', year: 2026, date: '2026-06-01', sortOrder: 0 },
  { title: 'Undated selected release in press', year: 2026, date: '2026-09-01', releaseDate: '', publicationSortBy: 'releaseDate', category: 'In press', sortOrder: 0 },
];
assert.equal(publicationSortDate(mixedDates[0]), '2026-10-12');
assert.equal(publicationSortDate(mixedDates[2]), '2026-06-01');
assert.equal(isUndatedInPress(mixedDates[3]), true);
assert.deepEqual([...mixedDates].sort(comparePublications).map(x => x.title), [
  'Undated selected release in press', 'Release date selected', 'Posting date selected', 'Existing record defaults to posting date',
]);
assert.deepEqual([...mixedDates].sort((a,b)=>comparePublications(a,b,'oldest')).map(x => x.title), [
  'Undated selected release in press', 'Existing record defaults to posting date', 'Posting date selected', 'Release date selected',
]);
console.log('Per-publication date basis, legacy default, and in-press priority passed.');
