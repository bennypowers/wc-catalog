/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {readFile} from 'fs/promises';
import {resolve, dirname} from 'path';
import {makeExecutableSchema} from '@graphql-tools/schema';

import type {Resolvers} from './schema.js';
import {deletePackage, getPackageInfo, importPackage} from './firestore.js';

const schemaPath = resolve(
  dirname(new URL(import.meta.url).pathname),
  '../src/lib/schema.graphql'
);
const schemaSource = await readFile(schemaPath, 'utf8');

const resolvers: Resolvers = {
  Query: {
    async package(_parent, {packageName}: {packageName: string}) {
      const packageInfo = await getPackageInfo(packageName);
      if (packageInfo !== undefined) {
        return packageInfo;
      } else {
        console.log('package not found in db');
        return importPackage(packageName);
      }
    },
  },
  Mutation: {
    async deletePackage(_parent, {packageName}: {packageName: string}) {
      await deletePackage(packageName);
      return true;
    },
  },
};

export const schema = makeExecutableSchema({
  typeDefs: schemaSource,
  resolvers,
  logger: {
    log: console.error,
  },
});
