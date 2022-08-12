import { Plugin, DontCodeModel, PluginConfig, Core } from '@dontcode/core';

/**
 * This plugin demonstrate 2 things:
 * - how to declare a new field type that can be selected in the Builder and how to manage the display and edition of this new type in the Previewer.
 * - As well it adds a new attribute 'seed' to any Entity and provides a viewer for the Previewer when its value is Yes or Maybe.
 */
export class ReportPlugin implements Plugin {
  getConfiguration(): PluginConfig {
    return {
      plugin: {
        id: 'ReportPlugin',
        'display-name':
          'An starter project for development of Dont-code plugins.',
        version: '1.0.0',
      },
      'schema-updates': [
        {
          id: 'report-field',
          description: 'Add a new type of field to Dont-code: the ReportField',
          changes: [
            {
              location: {
                parent: '#/$defs/field',
                id: 'type',
              },
              update: {
                enum: ['Report Field'],
              },
              replace: false,
            },
          ],
        },
        {
          id: 'report-entity',
          description:
            "Adds 'report' attribute to any entity and display the entity if seed is Maybe or Yes",
          changes: [
            {
              location: {
                parent: '#/$defs/entity',
                id: 'report',
                after: 'name',
              },
              update: {
                enum: ['Yes', 'Maybe'],
              },
              replace: true,
            },
            {
              location: {
                parent: '/$defs/entity',
                id: 'report',
                after: 'name',
              },
              update: {
                enum: ['No'],
              },
              replace: false,
            },
          ],
        },
      ],
      'preview-handlers': [
        {
          location: {
            parent: DontCodeModel.APP_FIELDS,
            id: 'type',
            values: [
              {
                Report: {
                  enum: ['Report Field'],
                },
              },
            ],
          },
          class: {
            name: 'ReportFieldComponent',
            source: 'report',
          },
        },
        {
          location: {
            parent: DontCodeModel.APP_ENTITIES,
            id: 'report',
            values: ['Yes', 'Maybe'],
          },
          class: {
            name: 'ReportEntityComponent',
            source: 'report',
          },
        },
      ],
    };
  }

  pluginInit(dontCode: Core): void {
    // Nothing to do here
  }
}
