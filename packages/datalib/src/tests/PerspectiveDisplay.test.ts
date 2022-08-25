import { TableInfo } from 'dbgate-types';
import { PerspectiveDisplay } from '../PerspectiveDisplay';
import { PerspectiveTableNode } from '../PerspectiveTreeNode';
import { chinookDbInfo } from './chinookDbInfo';
import { createPerspectiveConfig, createPerspectiveNodeConfig } from '../PerspectiveConfig';
import artistDataFlat from './artistDataFlat';
import artistDataAlbum from './artistDataAlbum';
import artistDataAlbumTrack from './artistDataAlbumTrack';

test('test flat view', () => {
  const artistTable = chinookDbInfo.tables.find(x => x.pureName == 'Artist');
  const root = new PerspectiveTableNode(
    artistTable,
    { conid: { db: chinookDbInfo } },
    createPerspectiveConfig({ pureName: 'Artist' }),
    null,
    null,
    { conid: 'conid', database: 'db' },
    null,
    '1'
  );
  const display = new PerspectiveDisplay(root, artistDataFlat);

  // console.log(display.loadIndicatorsCounts);
  // console.log(display.rows);
  expect(display.rows.length).toEqual(4);
  expect(display.rows[0]).toEqual(
    expect.objectContaining({
      rowData: ['AC/DC'],
    })
  );
  expect(display.loadIndicatorsCounts).toEqual({
    Artist: 4,
  });
});

test('test one level nesting', () => {
  const artistTable = chinookDbInfo.tables.find(x => x.pureName == 'Artist');
  const config = createPerspectiveConfig({ pureName: 'Artist' });
  config.nodes[0].checkedNodes = ['Album'];
  const root = new PerspectiveTableNode(
    artistTable,
    { conid: { db: chinookDbInfo } },
    config,
    null,
    null,
    { conid: 'conid', database: 'db' },
    null,
    config.nodes[0].designerId
  );
  const display = new PerspectiveDisplay(root, artistDataAlbum);

  console.log(display.loadIndicatorsCounts);
  // console.log(display.rows);

  expect(display.rows.length).toEqual(6);
  expect(display.rows[0]).toEqual(
    expect.objectContaining({
      rowData: ['AC/DC', 'For Those About To Rock We Salute You'],
      rowSpans: [2, 1],
      rowCellSkips: [false, false],
    })
  );
  expect(display.rows[1]).toEqual(
    expect.objectContaining({
      rowData: [undefined, 'Let There Be Rock'],
      rowSpans: [1, 1],
      rowCellSkips: [true, false],
    })
  );
  expect(display.rows[2]).toEqual(
    expect.objectContaining({
      rowData: ['Accept', 'Balls to the Wall'],
      rowSpans: [2, 1],
      rowCellSkips: [false, false],
    })
  );
  expect(display.rows[5]).toEqual(
    expect.objectContaining({
      rowData: ['Alanis Morissette', 'Jagged Little Pill'],
      rowSpans: [1, 1],
    })
  );

  expect(display.loadIndicatorsCounts).toEqual({
    Artist: 6,
    'Artist.Album': 6,
  });
});

test('test two level nesting', () => {
  const artistTable = chinookDbInfo.tables.find(x => x.pureName == 'Artist');
  const config = createPerspectiveConfig({ pureName: 'Artist' });
  config.nodes.push(createPerspectiveNodeConfig({ pureName: 'Album' }));
  config.references.push({
    sourceId: config.nodes[0].designerId,
    targetId: config.nodes[1].designerId,
    designerId: '1',
    columns: [{ source: 'ArtistId', target: 'ArtistId' }],
  });
  config.nodes[0].checkedNodes = ['Album'];
  config.nodes[1].checkedNodes = ['Track'];

  const root = new PerspectiveTableNode(
    artistTable,
    { conid: { db: chinookDbInfo } },
    config,
    null,
    null,
    { conid: 'conid', database: 'db' },
    null,
    config.nodes[0].designerId
  );
  const display = new PerspectiveDisplay(root, artistDataAlbumTrack);

  console.log(display.rows);
  expect(display.rows.length).toEqual(8);
  expect(display.rows[0]).toEqual(
    expect.objectContaining({
      rowData: ['AC/DC', 'For Those About To Rock We Salute You', 'For Those About To Rock (We Salute You)'],
      rowSpans: [4, 2, 1],
      rowCellSkips: [false, false, false],
    })
  );
  expect(display.rows[1]).toEqual(
    expect.objectContaining({
      rowData: [undefined, undefined, 'Put The Finger On You'],
      rowSpans: [1, 1, 1],
      rowCellSkips: [true, true, false],
    })
  );
  expect(display.rows[2]).toEqual(
    expect.objectContaining({
      rowData: [undefined, 'Let There Be Rock', 'Go Down'],
      rowSpans: [1, 2, 1],
      rowCellSkips: [true, false, false],
    })
  );
});
