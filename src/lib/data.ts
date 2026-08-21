import fs from 'node:fs';
import path from 'node:path';
import * as yaml from 'js-yaml';
import { profileSchema, cvSchema, type Profile, type Cv } from '../schemas/profile';

function readYaml(relativePath: string): unknown {
  const absolute = path.resolve(process.cwd(), relativePath);
  return yaml.load(fs.readFileSync(absolute, 'utf8'));
}

export function loadProfile(): Profile {
  return profileSchema.parse(readYaml('src/data/profile.yml'));
}

export function loadCv(): Cv {
  return cvSchema.parse(readYaml('src/data/cv.yml'));
}
