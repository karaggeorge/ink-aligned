import test from 'ava';
import {h, renderToString} from 'ink';
import Aligned from '../lib';

test('Renders nothing', t => {
  t.is(renderToString(<Aligned/>), '\n');
});
