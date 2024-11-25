import moduleAlias from 'module-alias';
import path from 'path';

moduleAlias.addAliases({
  '@': path.join(__dirname, '..'),
  '@controllers': path.join(__dirname, '../controllers'),
  '@models': path.join(__dirname, '../models'),
  '@interfaces': path.join(__dirname, '../interfaces'),
  '@config': path.join(__dirname, '../config'),
  '@utils': path.join(__dirname, '../utils')
});