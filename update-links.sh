#!/bin/sh
cd ../core/node
nx run core:build
cd ../../plugins
nx run sandbox:build:development
nx run common:build:development

cd ../plugin-seed
npm link ../core/node/dist/packages/core ../plugins/dist/libs/common ../plugins/dist/libs/sandbox #../plugins/dist/libs/basic ../plugins/dist/libs/screen ../plugins/dist/libs/fields
